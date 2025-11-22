import { useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Visualization = () => {
  const navigate = useNavigate();
  const cesiumContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Cesium viewer will be initialized here
    // For now, showing a placeholder
    if (cesiumContainerRef.current) {
      cesiumContainerRef.current.innerHTML = `
        <div class="flex items-center justify-center h-full bg-secondary/50 rounded-lg">
          <div class="text-center p-8">
            <h3 class="text-2xl font-bold text-foreground mb-4">3D Orbital Visualization</h3>
            <p class="text-muted-foreground">Cesium viewer will display orbital trajectories and conjunction events here</p>
          </div>
        </div>
      `;
    }
  }, []);

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

        <header className="space-y-2">
          <h1 className="text-4xl font-bold text-foreground">3D Visualization</h1>
          <p className="text-muted-foreground">Interactive orbital trajectory viewer</p>
        </header>

        <Card className="p-6 bg-card border-border">
          <div 
            ref={cesiumContainerRef}
            className="w-full h-[600px] rounded-lg overflow-hidden"
          />
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4 bg-card border-border">
            <h4 className="font-semibold mb-2 text-foreground">Primary Object</h4>
            <p className="text-sm text-muted-foreground">NORAD ID: 12345</p>
            <p className="text-sm text-muted-foreground">Altitude: 550 km</p>
          </Card>
          <Card className="p-4 bg-card border-border">
            <h4 className="font-semibold mb-2 text-foreground">Secondary Object</h4>
            <p className="text-sm text-muted-foreground">NORAD ID: 67890</p>
            <p className="text-sm text-muted-foreground">Altitude: 548 km</p>
          </Card>
          <Card className="p-4 bg-card border-border">
            <h4 className="font-semibold mb-2 text-foreground">TCA</h4>
            <p className="text-sm text-muted-foreground">2024-12-22 14:23:45 UTC</p>
            <p className="text-sm text-muted-foreground">Miss: 125 m</p>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Visualization;
