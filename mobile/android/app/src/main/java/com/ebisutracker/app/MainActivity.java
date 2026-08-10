package com.ebisutracker.app;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onBackPressed() {
        if (getBridge().getWebView().canGoBack()) {
            getBridge().getWebView().goBack();
            return;
        }

        super.onBackPressed();
    }
}
