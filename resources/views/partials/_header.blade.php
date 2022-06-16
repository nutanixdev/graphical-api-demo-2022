<!doctype html>

<html lang="en-us">

<head>
    <meta charset="utf-8">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <link rel="stylesheet" type="text/css" href="/css/vendor/bootstrap.min.css">
    <link rel="stylesheet" type="text/css" href="/css/vendor/jquery.dropdown.css">
    <link rel="stylesheet" type="text/css" href="/css/vendor/jquery-ui.min.css">
    <link rel="stylesheet" type="text/css" href="/css/vendor/jquery-ui.structure.min.css">
    <link rel="stylesheet" type="text/css" href="/css/vendor/jquery-ui.theme.min.css">
    <link rel="stylesheet" type="text/css" href="/css/app.css">
    <link href='https://fonts.googleapis.com/css?family=Roboto:700' rel='stylesheet' type='text/css'>
    <link href='https://fonts.googleapis.com/css?family=Droid+Sans:400,700' rel='stylesheet' type='text/css'>
    <title>Nutanix REST API Demos</title>
</head>

<body style="">

<nav class="navbar navbar-default" role="navigation">
    <div class="container-fluid">
        <div class="collapse navbar-collapse" id="bs-example-navbar-collapse-1">
            <ul class="nav navbar-nav">
                <li class="active"><a href="http://www.nutanix.com" target="_blank" title="Nutanix.com">Nutanix.com</a>
                <li><a href="http://www.nutanix.dev" target="_blank" title="Nutanix.dev">Nutanix.dev</a></li>
                </li>
                <li><a href="http://www.nutanix.com/resources" target="_blank" title="Nutanix Resources">Nutanix
                        Resources</a></li>
                <li><a href="https://www.nutanix.dev/api-reference"
                       target="_blank" title="" Nutanix REST API">Nutanix REST API</a></li>
                <li class="dropdown">
                    <a href="#" class="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true"
                       aria-expanded="false">What the ... ? <span class="caret"></span></a>
                    <ul class="dropdown-menu">
                        <li><a id="set-contrast" href="#">Adjust Contrast ;)</a></li>
                    </ul>
                </li>
            </ul>
        </div>
    </div>
</nav>