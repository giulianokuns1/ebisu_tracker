package com.ebisutracker.app;

import android.app.DownloadManager;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.content.pm.PackageInfo;
import android.net.Uri;
import android.os.Environment;
import android.provider.Settings;

import androidx.core.content.FileProvider;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.io.File;

@CapacitorPlugin(name = "AppUpdate")
public class AppUpdatePlugin extends Plugin {
    private long updateDownloadId = -1;
    private final BroadcastReceiver downloadReceiver = new BroadcastReceiver() {
        @Override
        public void onReceive(Context context, Intent intent) {
            if (intent.getLongExtra(DownloadManager.EXTRA_DOWNLOAD_ID, -1) != updateDownloadId) return;
            updateDownloadId = -1;
            openInstaller();
        }
    };

    @Override
    public void load() {
        getContext().registerReceiver(downloadReceiver, new IntentFilter(DownloadManager.ACTION_DOWNLOAD_COMPLETE), Context.RECEIVER_NOT_EXPORTED);
    }

    @Override
    protected void handleOnDestroy() {
        getContext().unregisterReceiver(downloadReceiver);
        super.handleOnDestroy();
    }
    public void getVersion(PluginCall call) {
        try {
            PackageInfo packageInfo = getContext().getPackageManager().getPackageInfo(getContext().getPackageName(), 0);
            JSObject result = new JSObject();
            result.put("versionCode", packageInfo.getLongVersionCode());
            result.put("versionName", packageInfo.versionName);
            call.resolve(result);
        } catch (Exception error) {
            call.reject("Unable to read the installed app version.", error);
        }
    }

    public void install(PluginCall call) {
        String url = call.getString("url");
        if (url == null || url.isEmpty()) {
            call.reject("An update URL is required.");
            return;
        }

        if (!getContext().getPackageManager().canRequestPackageInstalls()) {
            Intent settingsIntent = new Intent(Settings.ACTION_MANAGE_UNKNOWN_APP_SOURCES, Uri.parse("package:" + getContext().getPackageName()));
            getActivity().startActivity(settingsIntent);
            call.reject("Allow installs from Ebisu Tracker, then tap Update again.");
            return;
        }

        DownloadManager.Request request = new DownloadManager.Request(Uri.parse(url));
        request.setTitle("Ebisu Tracker update");
        request.setDescription("Downloading the latest version");
        request.setNotificationVisibility(DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED);
        request.setDestinationInExternalFilesDir(getContext(), Environment.DIRECTORY_DOWNLOADS, "ebisu-tracker-update.apk");

        DownloadManager downloadManager = (DownloadManager) getContext().getSystemService(Context.DOWNLOAD_SERVICE);
        updateDownloadId = downloadManager.enqueue(request);
        call.resolve(new JSObject().put("downloadId", updateDownloadId));
    }

    private void openInstaller() {
        File apk = new File(getContext().getExternalFilesDir(Environment.DIRECTORY_DOWNLOADS), "ebisu-tracker-update.apk");
        if (!apk.exists()) return;

        Uri uri = FileProvider.getUriForFile(getContext(), getContext().getPackageName() + ".fileprovider", apk);
        Intent installIntent = new Intent(Intent.ACTION_VIEW);
        installIntent.setDataAndType(uri, "application/vnd.android.package-archive");
        installIntent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION | Intent.FLAG_ACTIVITY_NEW_TASK);
        getContext().startActivity(installIntent);
    }
}
