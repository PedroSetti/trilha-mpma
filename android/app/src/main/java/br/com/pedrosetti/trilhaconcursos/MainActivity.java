package br.com.pedrosetti.trilhaconcursos;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.app.DownloadManager;
import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.graphics.Color;
import android.net.Uri;
import android.net.http.SslError;
import android.os.Bundle;
import android.os.Message;
import android.view.View;
import android.view.WindowInsets;
import android.webkit.CookieManager;
import android.webkit.SslErrorHandler;
import android.webkit.URLUtil;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.LinearLayout;
import android.widget.ProgressBar;
import android.widget.Toast;

public final class MainActivity extends Activity {
 private static final String HOME="https://trilha-concursos-pedro.netlify.app/";
 private static final int PICK_FILE=201;
 private WebView web;
 private ValueCallback<Uri[]> fileCallback;
 private View fullscreen;
 private WebChromeClient.CustomViewCallback fullscreenCallback;

 private boolean trusted(String url){try{Uri uri=Uri.parse(url);return "https".equals(uri.getScheme())&&"trilha-concursos-pedro.netlify.app".equals(uri.getHost())&&(uri.getPort()==-1||uri.getPort()==443)&&uri.getUserInfo()==null;}catch(Exception e){return false;}}
 private void external(String url){try{Uri uri=Uri.parse(url);if(!"https".equals(uri.getScheme())&&!"mailto".equals(uri.getScheme()))return;startActivity(new Intent(Intent.ACTION_VIEW,uri));}catch(ActivityNotFoundException e){Toast.makeText(this,"Não há aplicativo disponível para abrir este link.",Toast.LENGTH_SHORT).show();}}
 @SuppressLint("SetJavaScriptEnabled") @Override public void onCreate(Bundle state){
  super.onCreate(state);WebView.setWebContentsDebuggingEnabled(false);
  LinearLayout root=new LinearLayout(this);root.setOrientation(LinearLayout.VERTICAL);root.setBackgroundColor(Color.rgb(33,76,64));
  root.setOnApplyWindowInsetsListener((v,insets)->{if(android.os.Build.VERSION.SDK_INT>=30){android.graphics.Insets bars=insets.getInsets(WindowInsets.Type.systemBars()|WindowInsets.Type.displayCutout());v.setPadding(bars.left,bars.top,bars.right,bars.bottom);}else v.setPadding(insets.getSystemWindowInsetLeft(),insets.getSystemWindowInsetTop(),insets.getSystemWindowInsetRight(),insets.getSystemWindowInsetBottom());return insets;});
  setContentView(root);root.requestApplyInsets();ProgressBar loading=new ProgressBar(this,null,android.R.attr.progressBarStyleHorizontal);loading.setMax(100);root.addView(loading,new LinearLayout.LayoutParams(-1,6));
  web=new WebView(this);root.addView(web,new LinearLayout.LayoutParams(-1,0,1));WebSettings settings=web.getSettings();settings.setJavaScriptEnabled(true);settings.setDomStorageEnabled(true);settings.setAllowFileAccess(false);settings.setAllowContentAccess(true);settings.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);settings.setMediaPlaybackRequiresUserGesture(true);settings.setSupportMultipleWindows(true);settings.setUserAgentString(settings.getUserAgentString()+" TrilhaConcursos/1.0");CookieManager.getInstance().setAcceptCookie(true);
  web.setWebViewClient(new WebViewClient(){
   @Override public boolean shouldOverrideUrlLoading(WebView view,WebResourceRequest request){if(!request.isForMainFrame())return false;String url=request.getUrl().toString();if(trusted(url))return false;external(url);return true;}
   @Override public void onReceivedSslError(WebView view,SslErrorHandler handler,SslError error){handler.cancel();Toast.makeText(MainActivity.this,"Não foi possível verificar a conexão segura.",Toast.LENGTH_LONG).show();}
   @Override public void onReceivedError(WebView view,WebResourceRequest request,WebResourceError error){if(request.isForMainFrame())Toast.makeText(MainActivity.this,"Verifique a internet. Volte e abra o app novamente para tentar.",Toast.LENGTH_LONG).show();}
   @Override public void onPageFinished(WebView view,String url){CookieManager.getInstance().flush();}
  });
  web.setWebChromeClient(new WebChromeClient(){
   @Override public void onProgressChanged(WebView view,int value){loading.setProgress(value);loading.setVisibility(value==100?View.GONE:View.VISIBLE);}
   @Override public boolean onShowFileChooser(WebView view,ValueCallback<Uri[]> callback,FileChooserParams params){if(fileCallback!=null)fileCallback.onReceiveValue(null);fileCallback=callback;try{Intent intent=params.createIntent();intent.addCategory(Intent.CATEGORY_OPENABLE);startActivityForResult(intent,PICK_FILE);}catch(ActivityNotFoundException e){fileCallback.onReceiveValue(null);fileCallback=null;Toast.makeText(MainActivity.this,"Não foi possível abrir o seletor de arquivos.",Toast.LENGTH_SHORT).show();}return true;}
   @Override public boolean onCreateWindow(WebView view,boolean dialog,boolean gesture,Message result){if(!gesture)return false;WebView child=new WebView(MainActivity.this);child.setWebViewClient(new WebViewClient(){@Override public void onPageStarted(WebView v,String url,android.graphics.Bitmap icon){v.stopLoading();if(trusted(url))web.loadUrl(url);else external(url);v.destroy();}});((WebView.WebViewTransport)result.obj).setWebView(child);result.sendToTarget();return true;}
   @Override public void onShowCustomView(View view,CustomViewCallback callback){if(fullscreen!=null){callback.onCustomViewHidden();return;}fullscreen=view;fullscreenCallback=callback;web.setVisibility(View.GONE);root.addView(view,new LinearLayout.LayoutParams(-1,-1));}
   @Override public void onHideCustomView(){if(fullscreen==null)return;root.removeView(fullscreen);fullscreen=null;web.setVisibility(View.VISIBLE);if(fullscreenCallback!=null)fullscreenCallback.onCustomViewHidden();fullscreenCallback=null;}
  });
  web.setDownloadListener((url,agent,disposition,mime,length)->{if(!trusted(url)){external(url);return;}try{DownloadManager.Request request=new DownloadManager.Request(Uri.parse(url));String cookie=CookieManager.getInstance().getCookie(url);if(cookie!=null)request.addRequestHeader("Cookie",cookie);request.addRequestHeader("User-Agent",agent);request.setTitle(URLUtil.guessFileName(url,disposition,mime));request.setMimeType(mime);request.setNotificationVisibility(DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED);((DownloadManager)getSystemService(DOWNLOAD_SERVICE)).enqueue(request);Toast.makeText(this,"Download iniciado. Consulte os downloads do celular.",Toast.LENGTH_LONG).show();}catch(Exception e){Toast.makeText(this,"Não foi possível baixar o arquivo.",Toast.LENGTH_LONG).show();}});
  if(state==null||web.restoreState(state)==null)web.loadUrl(HOME);
 }
 @Override protected void onActivityResult(int request,int result,Intent data){super.onActivityResult(request,result,data);if(request==PICK_FILE&&fileCallback!=null){fileCallback.onReceiveValue(WebChromeClient.FileChooserParams.parseResult(result,data));fileCallback=null;}}
 @Override public void onBackPressed(){if(fullscreen!=null){web.getWebChromeClient().onHideCustomView();return;}if(web.canGoBack())web.goBack();else super.onBackPressed();}
 @Override protected void onSaveInstanceState(Bundle state){web.saveState(state);super.onSaveInstanceState(state);}
 @Override protected void onDestroy(){if(fileCallback!=null)fileCallback.onReceiveValue(null);if(web!=null){web.stopLoading();web.destroy();}super.onDestroy();}
}
