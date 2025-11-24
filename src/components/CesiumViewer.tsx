import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

// Cesium CSS import
import "cesium/Build/Cesium/Widgets/widgets.css";

declare global {
  interface Window {
    CESIUM_BASE_URL: string;
  }
}

interface CesiumViewerProps {
  primarySatellite?: {
    position: [number, number, number];
    noradId: string;
    altitude: number;
  };
  secondarySatellite?: {
    position: [number, number, number];
    noradId: string;
    altitude: number;
  };
  tca?: {
    time: string;
    missDistance: number;
  };
}

const CesiumViewer = ({ primarySatellite, secondarySatellite, tca }: CesiumViewerProps) => {
  const cesiumContainerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const initCesium = async () => {
      try {
        // Set Cesium base URL for assets
        window.CESIUM_BASE_URL = "/node_modules/cesium/Build/Cesium/";

        // Dynamically import Cesium
        const Cesium = await import("cesium");

        if (!mounted || !cesiumContainerRef.current) return;

        // Create viewer
        const viewer = new Cesium.Viewer(cesiumContainerRef.current, {
          terrainProvider: undefined,
          animation: false,
          baseLayerPicker: false,
          fullscreenButton: false,
          geocoder: false,
          homeButton: false,
          infoBox: false,
          sceneModePicker: false,
          selectionIndicator: false,
          timeline: false,
          navigationHelpButton: false,
          imageryProvider: new Cesium.TileMapServiceImageryProvider({
            url: Cesium.buildModuleUrl("Assets/Textures/NaturalEarthII"),
          }),
        });

        viewerRef.current = viewer;

        // Add primary satellite if provided
        if (primarySatellite) {
          viewer.entities.add({
            position: Cesium.Cartesian3.fromDegrees(
              primarySatellite.position[0],
              primarySatellite.position[1],
              primarySatellite.position[2] * 1000 // Convert km to meters
            ),
            point: {
              pixelSize: 10,
              color: Cesium.Color.CYAN,
              outlineColor: Cesium.Color.WHITE,
              outlineWidth: 2,
            },
            label: {
              text: `Primary\nNORAD: ${primarySatellite.noradId}`,
              font: "14px sans-serif",
              fillColor: Cesium.Color.WHITE,
              outlineColor: Cesium.Color.BLACK,
              outlineWidth: 2,
              style: Cesium.LabelStyle.FILL_AND_OUTLINE,
              verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
              pixelOffset: new Cesium.Cartesian2(0, -12),
            },
          });
        }

        // Add secondary satellite if provided
        if (secondarySatellite) {
          viewer.entities.add({
            position: Cesium.Cartesian3.fromDegrees(
              secondarySatellite.position[0],
              secondarySatellite.position[1],
              secondarySatellite.position[2] * 1000 // Convert km to meters
            ),
            point: {
              pixelSize: 10,
              color: Cesium.Color.RED,
              outlineColor: Cesium.Color.WHITE,
              outlineWidth: 2,
            },
            label: {
              text: `Secondary\nNORAD: ${secondarySatellite.noradId}`,
              font: "14px sans-serif",
              fillColor: Cesium.Color.WHITE,
              outlineColor: Cesium.Color.BLACK,
              outlineWidth: 2,
              style: Cesium.LabelStyle.FILL_AND_OUTLINE,
              verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
              pixelOffset: new Cesium.Cartesian2(0, -12),
            },
          });

          // Draw line between satellites if both exist
          if (primarySatellite) {
            viewer.entities.add({
              polyline: {
                positions: [
                  Cesium.Cartesian3.fromDegrees(
                    primarySatellite.position[0],
                    primarySatellite.position[1],
                    primarySatellite.position[2] * 1000
                  ),
                  Cesium.Cartesian3.fromDegrees(
                    secondarySatellite.position[0],
                    secondarySatellite.position[1],
                    secondarySatellite.position[2] * 1000
                  ),
                ],
                width: 2,
                material: Cesium.Color.YELLOW,
              },
            });
          }
        }

        // Zoom to show both satellites
        if (primarySatellite && secondarySatellite) {
          viewer.camera.flyTo({
            destination: Cesium.Cartesian3.fromDegrees(
              (primarySatellite.position[0] + secondarySatellite.position[0]) / 2,
              (primarySatellite.position[1] + secondarySatellite.position[1]) / 2,
              Math.max(primarySatellite.position[2], secondarySatellite.position[2]) * 2000
            ),
            duration: 2,
          });
        } else {
          viewer.camera.flyHome(2);
        }

        setIsLoading(false);
      } catch (err) {
        console.error("Failed to initialize Cesium:", err);
        setError("Failed to load 3D visualization");
        toast.error("Failed to load 3D visualization");
        setIsLoading(false);
      }
    };

    initCesium();

    return () => {
      mounted = false;
      if (viewerRef.current) {
        viewerRef.current.destroy();
        viewerRef.current = null;
      }
    };
  }, [primarySatellite, secondarySatellite, tca]);

  if (error) {
    return (
      <div className="flex items-center justify-center h-full bg-secondary/50 rounded-lg">
        <div className="text-center p-8">
          <h3 className="text-2xl font-bold text-foreground mb-4">Error Loading Visualization</h3>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-secondary/50 rounded-lg z-10">
          <div className="text-center p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading 3D visualization...</p>
          </div>
        </div>
      )}
      <div ref={cesiumContainerRef} className="w-full h-full rounded-lg overflow-hidden" />
    </div>
  );
};

export default CesiumViewer;
