<h1 align="center" id="title">Shop Manager Back Office</h1>

<p align="center">
 <img alt="Static Badge" src="https://img.shields.io/badge/Release-V--1.0.0-black?logoColor=%23000000&logoSize=16px&label=Release&labelColor=%230a66c2&color=%23c6cdcc">
 <img src="https://img.shields.io/badge/NodeJs-V--22.0.0-black?logo=npm&logoColor=%23000000&logoSize=16px&label=NodeJS&labelColor=%2397ca00&color=%23c6cdcc" alt="shields" />
</p>

<br/>

Complete website for a Shop back office made with vue 3 and TypeScript and scss for managing a shop, creating products, managing categories and shows/exhibitions. It features a complete product management system, including advanced product search, the ability to create, edit and delete products. 
It also includes a category management system, allowing users to create and manage categories for their products. The website is fully responsive, ensuring that it looks great on all devices.
It features a dockerized environment for easy development and deployment, as well as a CI/CD pipeline for automated testing and deployment. The website is also integrated with Google Cloud Translation API for multilingual support, allowing users to easily translate the website into different languages.

<br/>

<h2 id="desc">💻 Built with</h2>
<table align="center" style="border-collapse: collapse; border: none;">
  <tr>
    <td style="padding: 10px; border: none;">
      <img src="https://upload.wikimedia.org/wikipedia/commons/4/4c/Typescript_logo_2020.svg" alt="logo javascript" width="50px" height="50px" />
    </td>
    <td style="padding: 10px; border: none;">
      <img src="https://upload.wikimedia.org/wikipedia/commons/9/95/Vue.js_Logo_2.svg" alt="logo vue" width="50px" height="50px" />
    </td>
    <td style="padding: 10px; border: none;">
      <img src="https://upload.wikimedia.org/wikipedia/commons/1/1c/Pinialogo.svg" alt="logo pinia" width="50px" height="50px" />
    </td>
    <td style="padding: 10px; border: none;">
      <img src="https://upload.wikimedia.org/wikipedia/commons/9/96/Sass_Logo_Color.svg" alt="logo sass" width="50px" height="50px" />
    </td>
  </tr>
</table>

<br/>

<h2 id="cloudT"> <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" width="22x" align="center" height="22px" /> Google Translate</h2>

The back office panel uses the text translation service offered by Google Cloud. <br/>
The service is Cloud translate API (_Cloud translation - BASIC_) <br/>
It has a limit of 500,000 characters per month for free and has a maximum number of characters per request. <br/>
The service use an **API KEY** that is saved in the **.env.production** and **env.test** files of the [back end project](https://github.com/ValerioGc/laravel-store-manager)

<br/>

## 🚀 Github Actions

The project is integrated with GitHub Actions for CI/CD. The pipeline is triggered on every push to the deploy_prod/deploy_test branch. The pipeline includes the following steps:

- **Version and changelog extraction**: The version and changelog are extracted from the package.json file to be used in the release process.
- **Build**: The project is built using the build script.
- **Test**: The project is tested using the test script.
- **Deploy**: The compiled build is deployed to the production/test branch.
- **Sitemap**: The sitemap is generated using the sitemap script.
- **Github release**: The project is released on GitHub using the release script and **tagged with version numbers**.

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

<h2 id="docker">Docker integration</h2>

The project uses Docker to run the application and perform other operations without having NodeJs installed locally. The script compiles for development using a nodeJs:alpine environment via Docker.

**Start the project with docker on Windows environments**

```bash
npm run docker:win
```

**Start the project with docker on Linux environments**

```bash
npm run docker:linux
```

<br/>

It's also present a docker script for running the compiled files on VPS/VM on nodeJs:alpine instance

**Start the project with docker in test mode**

```bash
npm run docker:deploy -- {mode}
```

##### _Avaliable Mode_:

> - development
> - test
> - prod

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
