import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Download } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

const EventDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <Button
          variant="ghost"
          onClick={() => navigate("/results")}
          className="text-foreground hover:bg-secondary"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Results
        </Button>

        <header className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-4">
              <h1 className="text-4xl font-bold text-foreground">Event {id}</h1>
              <Badge className="bg-risk-high">High Risk</Badge>
            </div>
            <p className="text-muted-foreground">Detailed analysis and uncertainty breakdown</p>
          </div>
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Download className="mr-2 h-4 w-4" />
            Download PDF
          </Button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6 bg-card border-border">
            <h3 className="text-xl font-bold mb-4 text-foreground">Prediction Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Predicted log10(Pc):</span>
                <span className="font-mono font-bold text-foreground">-5.92</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Epistemic Uncertainty:</span>
                <span className="font-mono text-foreground">0.45</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Aleatoric Uncertainty:</span>
                <span className="font-mono text-foreground">3.44</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Risk Category:</span>
                <Badge className="bg-risk-high">High</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Stage:</span>
                <span className="font-mono text-foreground">Stage-2 (Refined)</span>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-card border-border">
            <h3 className="text-xl font-bold mb-4 text-foreground">Event Details</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">TCA:</span>
                <span className="font-mono text-foreground">2024-12-22 14:23:45</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Miss Distance:</span>
                <span className="font-mono text-foreground">125 m</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Relative Velocity:</span>
                <span className="font-mono text-foreground">14.2 km/s</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Primary Object:</span>
                <span className="font-mono text-foreground">NORAD 12345</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Secondary Object:</span>
                <span className="font-mono text-foreground">NORAD 67890</span>
              </div>
            </div>
          </Card>
        </div>

        <Card className="p-6 bg-card border-border">
          <h3 className="text-xl font-bold mb-4 text-foreground">Uncertainty Analysis</h3>
          <p className="text-muted-foreground mb-4">
            Monte Carlo dropout analysis with T=100 samples
          </p>
          <div className="aspect-video bg-secondary/50 rounded-lg flex items-center justify-center">
            <p className="text-muted-foreground">Uncertainty distribution plot will be displayed here</p>
          </div>
        </Card>

        <Card className="p-6 bg-card border-border">
          <h3 className="text-xl font-bold mb-4 text-foreground">Feature Engineering</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Angle R-V (relative):</p>
              <p className="font-mono text-foreground">42.3°</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Log Error Volume:</p>
              <p className="font-mono text-foreground">8.92</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Miss/σR:</p>
              <p className="font-mono text-foreground">2.34</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Δ Inclination:</p>
              <p className="font-mono text-foreground">0.82°</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default EventDetail;
