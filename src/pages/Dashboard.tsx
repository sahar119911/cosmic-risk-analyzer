import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Upload, Activity, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <header className="space-y-2">
          <h1 className="text-4xl font-bold text-foreground">Conjunction Risk Assessment</h1>
          <p className="text-muted-foreground">Physics-Informed GAT Model Analysis Platform</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 bg-card border-border hover:shadow-[var(--shadow-elevated)] transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">High Risk Events</p>
                <p className="text-3xl font-bold text-risk-high">24</p>
              </div>
              <AlertTriangle className="h-12 w-12 text-risk-high opacity-80" />
            </div>
          </Card>

          <Card className="p-6 bg-card border-border hover:shadow-[var(--shadow-elevated)] transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Medium Risk Events</p>
                <p className="text-3xl font-bold text-risk-medium">87</p>
              </div>
              <Activity className="h-12 w-12 text-risk-medium opacity-80" />
            </div>
          </Card>

          <Card className="p-6 bg-card border-border hover:shadow-[var(--shadow-elevated)] transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Low Risk Events</p>
                <p className="text-3xl font-bold text-risk-low">342</p>
              </div>
              <TrendingUp className="h-12 w-12 text-risk-low opacity-80" />
            </div>
          </Card>
        </div>

        <Card className="p-6 bg-card border-border">
          <h2 className="text-2xl font-bold mb-4 text-foreground">Quick Actions</h2>
          <div className="flex gap-4">
            <Button 
              onClick={() => navigate("/upload")}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Upload className="mr-2 h-4 w-4" />
              Upload CDM File
            </Button>
            <Button 
              variant="outline"
              onClick={() => navigate("/visualization")}
              className="border-border text-foreground hover:bg-secondary"
            >
              View 3D Visualization
            </Button>
          </div>
        </Card>

        <Card className="p-6 bg-card border-border">
          <h2 className="text-2xl font-bold mb-4 text-foreground">Recent Analyses</h2>
          <div className="space-y-3">
            {[
              { id: "EVT-2024-001", risk: "High", pc: "1.2e-4", time: "2 hours ago" },
              { id: "EVT-2024-002", risk: "Medium", pc: "3.4e-6", time: "5 hours ago" },
              { id: "EVT-2024-003", risk: "Low", pc: "8.9e-8", time: "1 day ago" },
            ].map((event) => (
              <div 
                key={event.id}
                className="flex items-center justify-between p-4 bg-secondary rounded-lg hover:bg-secondary/80 transition-colors cursor-pointer"
                onClick={() => navigate(`/event/${event.id}`)}
              >
                <div className="flex items-center gap-4">
                  <span className="font-mono text-foreground">{event.id}</span>
                  <Badge 
                    variant={event.risk === "High" ? "destructive" : "default"}
                    className={
                      event.risk === "High" ? "bg-risk-high" :
                      event.risk === "Medium" ? "bg-risk-medium" :
                      "bg-risk-low"
                    }
                  >
                    {event.risk} Risk
                  </Badge>
                </div>
                <div className="text-right">
                  <p className="font-mono text-sm text-foreground">Pc: {event.pc}</p>
                  <p className="text-xs text-muted-foreground">{event.time}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
