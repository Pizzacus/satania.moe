# Satania: The best Waifu. Ever.

This is a website for those who wanna praise Satania, you can actually browse it at <https://satania.moe>

This repo is for the people interested in the code

## Getting started

* Install (if you don't have them):
    * [Node.js](http://nodejs.org)
    * [Brunch](http://brunch.io): `npm install -g brunch` or `yarn global add brunch`
    * Brunch plugins and app dependencies: `npm install` or `yarn`
* Run:
    * `npm start` — watches the project with continuous rebuild. This will also launch HTTP server with [pushState](https://developer.mozilla.org/en-US/docs/Web/Guide/API/DOM/Manipulating_the_browser_history).
    * `npm run build` — builds minified project for production
* About our building system:
    * We use [Brunch](http://brunch.io) to build satania.moe, brunch performs many tasks such as minifying data, compacting the files, ect...
    * `public/` dir is fully auto-generated and served by HTTP server. The code is in the `app/` dir.
    * Place static files you want to be copied from `app/assets/` to `public/`.
    * To learn more about Brunch: [Brunch site](http://brunch.io), [Getting started guide](https://github.com/brunch/brunch-guide#readme)

## Translating

* Go to <https://satania.moe/#translator-mode>, new buttons will appear on the top-left
* Click on "Download" to get a copy of every string of text on the website
* Use an IDE such as [Notepad++](https://notepad-plus-plus.org/) to edit the YAML file
* Use the "Browse..." button on satania.moe in translator mode to load your YAML file on the website to preview your changes locally
* Once you're done, send your translation to **Pizzacus#0061** on Discord, or to **/u/pizzacus** on Reddit
* Or, if you know how to use GitHub (this step is optional), fork this project to your account, clone it to your computer,
convert the YAML to JSON and add it to /app/assets/locale and add the option for it in the index.html file around line 128, then you can do a pull request

## License

This ~~Shitpost~~ project is released under the SDL 1.0 License (the Satania Daiakuma License), which is basically like MIT, except you can't use this project to promote any other characters except Satania, more infos are in the `LICENSE.md` file.

Yeah, I really thought of everything...
