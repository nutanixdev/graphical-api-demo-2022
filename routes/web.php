<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\AjaxController;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

Route::view('/', 'home.index')->name('home_path');

Route::controller(AjaxController::class)->group(function () {
    Route::post('/ajax/read-demo', 'read_demo');
    Route::post('/ajax/demo-container', 'container_demo');
    Route::post('/ajax/shell-vm', 'shell_demo');
    Route::post('/ajax/cloud-init-vm', 'cloud_init_demo');
    Route::post('/ajax/load-cluster-details', 'load_cluster_details');
});
