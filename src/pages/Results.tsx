import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Download } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Results = () => {
  const navigate = useNavigate();

  const events = [
    { id: "EVT-001", prediction: -5.92, epistemic: 0.45, aleatoric: 3.44, risk: "High", stage: "Stage-2" },
    { id: "EVT-002", prediction: -7.23, epistemic: 0.32, aleatoric: 2.87, risk: "Medium", stage: "Stage-2" },
    { id: "EVT-003", prediction: -9.14, epistemic: 0.28, aleatoric: 2.12, risk: "Low", stage: "Stage-1" },
  ];

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="text-foreground hover:bg-secondary"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>

        <header className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-foreground">Prediction Results</h1>
            <p className="text-muted-foreground">Analysis completed using Physics-Informed GAT model</p>
          </div>
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </header>

        <Card className="p-6 bg-card border-border overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-3 text-foreground">Event ID</th>
                <th className="text-left p-3 text-foreground">Prediction (log10 Pc)</th>
                <th className="text-left p-3 text-foreground">Epistemic σ</th>
                <th className="text-left p-3 text-foreground">Aleatoric σ</th>
                <th className="text-left p-3 text-foreground">Risk Level</th>
                <th className="text-left p-3 text-foreground">Stage</th>
                <th className="text-left p-3 text-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {events.map((event) => (
                <tr key={event.id} className="border-b border-border hover:bg-secondary/50">
                  <td className="p-3 font-mono text-foreground">{event.id}</td>
                  <td className="p-3 font-mono text-foreground">{event.prediction}</td>
                  <td className="p-3 font-mono text-foreground">{event.epistemic}</td>
                  <td className="p-3 font-mono text-foreground">{event.aleatoric}</td>
                  <td className="p-3">
                    <Badge 
                      className={
                        event.risk === "High" ? "bg-risk-high" :
                        event.risk === "Medium" ? "bg-risk-medium" :
                        "bg-risk-low"
                      }
                    >
                      {event.risk}
                    </Badge>
                  </td>
                  <td className="p-3 text-muted-foreground">{event.stage}</td>
                  <td className="p-3">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => navigate(`/event/${event.id}`)}
                      className="border-border text-foreground hover:bg-secondary"
                    >
                      Details
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6 bg-card border-border">
            <h3 className="text-xl font-bold mb-4 text-foreground">Risk Distribution</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-foreground">High Risk</span>
                  <span className="text-sm font-mono text-foreground">33%</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div className="bg-risk-high h-2 rounded-full" style={{ width: "33%" }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-foreground">Medium Risk</span>
                  <span className="text-sm font-mono text-foreground">33%</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div className="bg-risk-medium h-2 rounded-full" style={{ width: "33%" }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-foreground">Low Risk</span>
                  <span className="text-sm font-mono text-foreground">34%</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div className="bg-risk-low h-2 rounded-full" style={{ width: "34%" }} />
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-card border-border">
            <h3 className="text-xl font-bold mb-4 text-foreground">Model Performance</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Mean Absolute Error:</span>
                <span className="font-mono text-foreground">0.42</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">R² Score:</span>
                <span className="font-mono text-foreground">0.94</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Processing Time:</span>
                <span className="font-mono text-foreground">2.3s</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Events Analyzed:</span>
                <span className="font-mono text-foreground">3</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Results;
