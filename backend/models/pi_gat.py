"""
PI-GAT Model Architecture
Physics-Informed Graph Attention Network with Uncertainty Quantification
"""

import torch
import torch.nn as nn
import torch.nn.functional as F
import numpy as np


class PhysicsInformedGAT_Uncertainty(nn.Module):
    """
    Physics-Informed Graph Attention Network with MC-Dropout Uncertainty
    """
    
    def __init__(self, node_feat_dim, hidden_dim, edge_feat_dim, readout_dim, dropout_p=0.4):
        super().__init__()
        self.gat1 = nn.Linear(node_feat_dim + edge_feat_dim, hidden_dim)
        self.gat2 = nn.Linear(hidden_dim, readout_dim)
        self.dropout_feat = nn.Dropout(p=dropout_p)
        self.dropout_attn = nn.Dropout(p=dropout_p)
        self.mu_head = nn.Linear(readout_dim * 2, 1)
        self.sigma_head = nn.Linear(readout_dim * 2, 1)

        self._init_weights()

    def _init_weights(self):
        """Conservative initialization for stability"""
        for m in self.modules():
            if isinstance(m, nn.Linear):
                nn.init.xavier_normal_(m.weight, gain=0.5)
                if m.bias is not None:
                    nn.init.zeros_(m.bias)

        nn.init.normal_(self.mu_head.weight, mean=0, std=0.001)
        nn.init.zeros_(self.mu_head.bias)

        nn.init.constant_(self.sigma_head.bias, np.log(np.exp(1.0) - 1.0))
        nn.init.normal_(self.sigma_head.weight, mean=0, std=0.01)

    def forward(self, x, edge_index, edge_attr, readout_edge_indices,
                obj1_event_indices, obj2_event_indices):
        """
        Forward pass
        
        Args:
            x: Node features [num_nodes, node_feat_dim]
            edge_index: Edge connectivity [2, num_edges]
            edge_attr: Edge features [num_edges, edge_feat_dim]
            readout_edge_indices: Event indices for readout
            obj1_event_indices: Primary object indices per event
            obj2_event_indices: Secondary object indices per event
            
        Returns:
            mu: Mean predictions (normalized)
            sigma: Uncertainty estimates
            h2: Node embeddings
        """
        src, dst = edge_index
        edge_input = torch.cat([x[src], edge_attr], dim=1)

        h1 = F.relu(self.gat1(edge_input))
        h1 = self.dropout_feat(h1)

        # Aggregation
        num_nodes = x.shape[0]
        node_aggr = torch.zeros((num_nodes, h1.shape[1]), device=x.device)
        node_aggr.index_add_(0, dst, h1)
        node_aggr = self.dropout_attn(node_aggr)

        h2 = F.relu(self.gat2(node_aggr))
        h2 = self.dropout_feat(h2)

        # Event-level predictions
        h_event = torch.cat([h2[obj1_event_indices], h2[obj2_event_indices]], dim=1)
        mu = self.mu_head(h_event).squeeze(-1)
        sigma = F.softplus(self.sigma_head(h_event)).squeeze(-1) + 1e-3

        return mu, sigma, h2


class Stage2Regressor(nn.Module):
    """Stage-2 refinement model for high-risk events"""
    
    def __init__(self, input_dim):
        super().__init__()
        self.net = nn.Sequential(
            nn.Linear(input_dim, 256), 
            nn.ReLU(), 
            nn.BatchNorm1d(256), 
            nn.Dropout(0.3),
            nn.Linear(256, 128), 
            nn.ReLU(), 
            nn.BatchNorm1d(128), 
            nn.Dropout(0.2),
            nn.Linear(128, 64), 
            nn.ReLU(),
            nn.Linear(64, 1)
        )
    
    def forward(self, x):
        return self.net(x).squeeze(-1)