import React, { useRef, useEffect } from "react";
import { StyleSheet, View } from "react-native";
import { WebView } from "react-native-webview";

const FltkView: React.FC = () => {
  const webViewRef = useRef<WebView>(null);

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          canvas {
            width: 100%;
            height: 100%;
            touch-action: none;
          }
        </style>
      </head>
      <body>
        <canvas id="fltk-canvas"></canvas>
        <script>
          // This will be replaced with the actual WASM initialization
          async function initFltk() {
            const { FltkApp } = await import('./pkg/mobile_photo_editor.js');
            const canvas = document.getElementById('fltk-canvas');
            const app = new FltkApp(canvas);
            
            // Handle touch events
            canvas.addEventListener('touchstart', (e) => {
              const touch = e.touches[0];
              app.handle_input(touch.clientX, touch.clientY);
            });
          }
          
          initFltk().catch(console.error);
        </script>
      </body>
    </html>
    `;

  const handleMessage = (event: any) => {
    // Handle messages from FLTK/WebView
    console.log("Message from WebView:", event.nativeEvent.data);
  };

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        source={{ html: htmlContent }}
        onMessage={handleMessage}
        style={styles.webview}
        scrollEnabled={false}
        bounces={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webview: {
    flex: 1,
    backgroundColor: "transparent",
  },
});

export default FltkView;
