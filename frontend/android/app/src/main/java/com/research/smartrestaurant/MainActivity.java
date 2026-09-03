package com.research.smartrestaurant;

import android.os.Build;
import android.os.Bundle;
import android.view.View;
import android.view.WindowManager;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsControllerCompat;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        // Setup true fullscreen layout to fit edge-to-edge on Samsung Galaxy S10 5G
        WindowCompat.setDecorFitsSystemWindows(getWindow(), false);
        
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
            WindowManager.LayoutParams lp = getWindow().getAttributes();
            lp.layoutInDisplayCutoutMode = WindowManager.LayoutParams.LAYOUT_IN_DISPLAY_CUTOUT_MODE_SHORT_EDGES;
            getWindow().setAttributes(lp);
        }
        
        getWindow().setStatusBarColor(android.graphics.Color.TRANSPARENT);
        getWindow().setNavigationBarColor(android.graphics.Color.TRANSPARENT);

        // Set initial status bar icon appearance so system UI color matches app theme.
        // Default to dark icons (black time/signal/battery) for light launch splash.
        // The React app will immediately override this with StatusBar.setStyle() on load.
        View decorView = getWindow().getDecorView();
        WindowInsetsControllerCompat insetsController =
            new WindowInsetsControllerCompat(getWindow(), decorView);
        // APPEARANCE_LIGHT_STATUS_BARS = dark icons on light background (light mode default)
        insetsController.setAppearanceLightStatusBars(true);
        // APPEARANCE_LIGHT_NAVIGATION_BARS = dark icons on light background for nav bar
        insetsController.setAppearanceLightNavigationBars(true);
    }
}

