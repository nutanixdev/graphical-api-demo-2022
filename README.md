# Graphical API Demo 2022

Demo of the Nutanix Prism Element REST API v2.0

Intended for use in customer-facing demos, although you're welcome to download and use this as you see fit.

## Usage & Requirements

- PHP >= 8.x
- Local install of [PHP Composer](https://getcomposer.org/)
- Local install of `git` (recommended, although you can download the entire app from this repo)

### Preparation

- Clone repo: `git clone https://github.com/nutanixdev/graphical-api-demo-2022`
- Create environment configuration: `mv .env.example .env`
- Install dependencies: `composer update`
- Generate session key: `php artisan key:generate`
- Run: `php artisan serve`
- Complete the form, noting this demo is designed to work with Prism Element ONLY (not Prism Central)
- Select the demo you'd like to run and click "Run Demo"

