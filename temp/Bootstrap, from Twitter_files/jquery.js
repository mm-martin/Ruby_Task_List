<!DOCTYPE html>
<html>
<head>
  <style type="text/css">
  body { text-align:center;font-family:helvetica,arial;font-size:22px;
    color:#888;margin:20px}
  #c {margin:0 auto;width:500px;text-align:left}
  </style>
</head>
<body>
  <h2>Sinatra doesn&rsquo;t know this ditty.</h2>
  <img src='http://localhost:4567/__sinatra__/404.png'>
  <div id="c">
    Try this:
    <pre>get '/assets/js/jquery.js' do
  "Hello World"
end</pre>
  </div>
</body>
</html>
