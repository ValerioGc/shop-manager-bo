<h1 align="center" id="title">Shop Manager Back Office</h1>

<p align="center"><img src="https://github.com/ValerioGc/shop_manager_bo/src/assets/logo.svg" width="210px" height="150px" alt="project-image"></p>

<p align="center">
 <img alt="Static Badge" src="https://img.shields.io/badge/Release-V--1.0.0-black?logoColor=%23000000&logoSize=16px&label=Release&labelColor=%230a66c2&color=%23c6cdcc">
 <img src="https://img.shields.io/badge/NodeJs-V--22.0.0-black?logo=npm&logoColor=%23000000&logoSize=16px&label=NodeJS&labelColor=%2397ca00&color=%23c6cdcc" alt="shields" />
</p>

<p align="" id="description">
Complete website for a Shop back officemade with vue 3 and TypeScript. It's a complete back office for managing a shop, creating products, managing categories and shows. It features a complete product management system, including the ability to create, edit and delete products. It also includes a category management system, allowing users to create and manage categories for their products. The website is fully responsive, ensuring that it looks great on all devices.
The website is built using the latest web technologies, including Vue 3 and TypeScript, providing a modern and efficient development experience. The website is designed to be user-friendly and easy to navigate, making it accessible to users of all skill levels. The website is fully responsive, ensuring that it looks great on all devices.
It features a dockerized environment for easy development and deployment, as well as a CI/CD pipeline for automated testing and deployment. The website is also integrated with Google Cloud Translation API for multilingual support, allowing users to easily translate the website into different languages. The website is built with security in mind, using best practices for authentication and authorization to protect user data. Overall, this website is a powerful and flexible solution for managing a shop back office, providing all the tools and features needed to run a successful online store.

<br/>
</p>

---

### 🗺️ Table of content

- [Description and technologies](#desc)
- [Installation](#installation)
- [Wiki](#wiki)
    > - [Build](#build)
    > - [Unit test](#test)
    > - [Rules and branch structure](#branch)
    > - [Deploy](#deploy)
    > - [Docker](#docker)
    > - [Google Cloud API](#cloudT)

<br/> 
<h2 id="desc">💻 Built with</h2>

<p>Tecnologies and libraries used in this project:</p>

<div align="center">
<h4>Libraries:</h4> 
<table align="center" style="border-collapse: collapse; border: none;">
  <tr>
    <td style="padding: 10px; border: none;">
      Vue router <b>V_2.3.0</b>
    </td>
    <td style="padding: 10px; border: none;">
      Vue draggable <b>V_4.3.0</b>
    </td>
   </tr>
</table>

<br/>

<h4>Tecnologies:</h4>

<table align="center" style="border-collapse: collapse; border: none;">
  <tr>
    <td style="padding: 10px; border: none;">
      <img src="https://upload.wikimedia.org/wikipedia/commons/9/95/Vue.js_Logo_2.svg" alt="logo vue" width="50px" height="50px" />
    </td>
    <td style="padding: 10px; border: none;">
      <img src="https://upload.wikimedia.org/wikipedia/commons/4/4c/Typescript_logo_2020.svg" alt="logo javascript" width="50px" height="50px" />
    </td>
    <td style="padding: 10px; border: none;">
      <img src="https://upload.wikimedia.org/wikipedia/commons/9/96/Sass_Logo_Color.svg" alt="logo sass" width="50px" height="50px" />
    </td>
    <td style="padding: 10px; border: none;">
      <img src="https://upload.wikimedia.org/wikipedia/commons/1/1c/Pinialogo.svg" alt="logo pinia" width="50px" height="50px" />
    </td>
  </tr>
</table>

</div>

<br/>

## Suggested IDE configuration

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (disabled Vetur).

<h2 id="installation">🛠️ Installation Step:</h2>

##### 1. Install dependencies

```sh
npm install
```

##### 2. Update dependencies

```sh
npm update
```

##### 3. Compile for development (_Opens the website locally_)

```sh
npm run dev
```

##### 4. Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```

<br/>

<h2 id="wiki">📖 WIKI</h2>

General wiki for the project. Console commands, procedures, and links to services.

<br/>

<h2 id="test">🧪 Unit Test <a src="https://vitest.dev">[Vitest]</a></h2>
The testing process is already integrated into the build script and pipelines. However, it is possible to run tests in standalone mode with the following command:

```sh
npm run test:unit
```

<br/>

<h2 id="build">🔨 Build and Optimization for Deploy</h2>

There are several build processes based on the environment that can be used with these commands:

#### 1. Execute the build using the production .env files

```sh
npm run build:dev
```

#### 2. Execute the build using the production .env files

```sh
npm run build:prod
```

#### 3. Execute the build using the test .env files

```sh
npm run build:test
```

#### 5. Execute the build using the production .env files

```sh
npm run build:prod
```

<br/>

<h2 id="branch">🌱 Branch Rules</h2>

_The deploy branches are divided by environment. On push to the deploy_prod/test branch, the pipeline is triggered. The branches should only be used for releases in CI/CD with Github Action and Plesk_
[See 🧨Deploy section](#deploy)

- **dev**: Development and testing branch
- **deploy_test**: branch for release in the test environment
- **deploy_prod**: branch for release in the production environment

<br/>

<h2 id="deploy">🚀 Deploy</h2>

The release is performed via pipeline on GitHub actions.
[See the 🛠️Build section](#build)

It executes the webhook to notify Plesk (deployment manager) of the new version of the deploy.
The test pipeline is simplified. It builds and updates the test branch.

#### **Pipeline**:

- TEST_deploy_pipeline_ci
- PROD_deploy_pipeline_ci

<br/>

### **Deploy Script**

The deployment process is automated through scripts that can be used via NodeJS commands.

**Start the production pipeline on GitHub actions.**

```
npm run deploy:prod
```

<br/>

**Start the test pipeline on GitHub actions.**

```
npm run deploy:test
```

<br/>

### **Deploy Procedure for CI/CD Pipeline**

- Commit all changes to the dev branch and push
- Change branch depending on where you want to release `git checkout deploy_prod / checkout deploy_test` [_see branch section_](#branch)
- Pull the latest changes
- Merge with the command `git merge dev`
- Commit and push

### _Manual Release Procedure on Plesk Environment_

- Access the **Plesk panel** with the [link](https://web.plutone.vhosting-it.com:8443/login_up.php).
- Insert the user credentials and log in.
- Selezionare dal menu laterale il tab **'File'**.
- Navigare nella cartella **admin.shop.com** per il sito di <ins>produzione</ins> e **admin-test.shop.com** for the <ins>test</ins> environment.
- use the **build procedure** mentioned in the section [🔨Build and Optimization](#build) of the readme file.
- **Remove the files** in the destination folder and copy all the contents of the **dist** folder present in the project.
- Clean cache and browser data.

 <br/>

<h2 id="docker">
<img src="https://upload.wikimedia.org/wikipedia/commons/4/4e/Docker_%28container_engine%29_logo.svg" /> 
</h2>

The project uses docker to run the application and perform other operations without having to install NodeJs locally. The script compiles for development using a nodeJs:alpine environment via Docker.

**Start the project with docker on Windows environments**

```bash
npm run docker:win
```

**Start the project with docker on Linux environments**

```bash
npm run docker:linux
```

<br/>

There is also a docker script for running the compiled application in production on VPS/VM using a nodeJs:alpine instance.

**Start the project with docker in test mode**

```bash
npm run docker:deploy -- {mode}
```

##### _Available modes_:

> - development
> - test
> - prod

<br/>

<h2 id="cloudT"> <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" width="22x" align="center" height="22px" /> Google Translate</h2>

The back office panel uses the text translation service offered by Google Cloud. <br/>
The service is Cloud translate API (_Cloud translation - BASIC_) <br/>
It has a limit of 500,000 characters per month for free and has a maximum number of characters per request. <br/>
The service use an **API KEY** that is saved in the **.env.production** and **env.test** files of the [back end project](https://github.com/ValerioGc/laravel-store-manager)

#### [**Link to Google Cloud console**](https://console.cloud.google.com?hl=it)

<br/>
