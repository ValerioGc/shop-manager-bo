<!-- LoginView.vue -->
<script setup lang="ts">

import { ref, watch } from 'vue';
import { useBoUserStore } from '@/stores/boUserStore';

import MsgToast from '@/components/messages/LoginToast.vue';
import CommonSpinner from '@/components/utils_components/placeholders/CommonSpinner.vue';

import logo from '@/assets/logo.svg';

import type { ErrorObj } from '@/types/ErrorObj';

interface LoginData {
  username: string;
  password: string;
  remember: boolean;
}

const store = useBoUserStore(); // User store

const loginData = ref<LoginData>({
  username: '',
  password: '',
  remember: false,
});

// **************** Status management ****************
const loading = ref(false);
const show_pw = ref(false);

// **************** Error management ****************
const msg_timer = ref(5000);
const errors = ref<ErrorObj[]>([]);

/**
 * Handle error messages and highlight the fields in case of error
 * @param mode - Error mode
 * @param field - Field to highlight
 */
const handleError = (mode: number, field: number | null): void => {
  const input_1 = document.getElementById('u');
  const input_2 = document.getElementById('p');
  const addon_1 = document.getElementById('ia1');
  const addon_2 = document.getElementById('ia2');
  const addon_3 = document.getElementById('ia3');
  const btn_input = document.getElementById('sb');

  if (mode === 1) {
    if (input_1) input_1.classList.remove('invalid');
    if (input_2) input_2.classList.remove('invalid');
    if (addon_1) addon_1.classList.remove('invalid');
    if (addon_2) addon_2.classList.remove('invalid');
    if (addon_3) addon_3.classList.remove('invalid');
    if (btn_input) btn_input.classList.remove('shake');
  }
  else {
    if (field === 0 || field === null) {
      if (input_1) {
        input_1.classList.add('invalid');
        if (addon_1) addon_1.classList.add('invalid');
      }
    }
    if (field === 1 || field === null) {
      if (input_2) {
        input_2.classList.add('invalid');
        if (addon_2) addon_2.classList.add('invalid');
        if (addon_3) addon_3.classList.add('invalid');
      }
    }
    if (btn_input) btn_input.classList.add('shake');
  }

  // Remove focus from fields in case of error
  if (mode === 0) {
    if (input_1) input_1.blur();
    if (input_2) input_2.blur();
  }
};

/**
 * Validate email address using regex pattern
 * call handleError(0, 0) in case of error
 * @param email {string} - Email to validate
 * @returns {boolean} - Email validation status
 */
const validateEmail = (email: string): boolean => {
  const emailPattern = /^[a-zA-Z0-9._%+-]{3,40}@[a-zA-Z0-9.-]{2,30}\.[a-zA-Z]{2,5}$/;
  if (!emailPattern.test(email)) {
    handleError(0, 0);
    return false;
  }
  return true;
};

/**
 * Validate password length 
 * Password must be at least 6 characters long
 * call handleError(0, 1) in case of error 
 * @param password {string} - Password to validate
 * @returns {boolean} - Password validation status
 */
const validatePassword = (password: string): boolean => {
  if (!password || password.length < 6) {
    handleError(0, 1);
    return false;
  }
  return true;
};

/**
 * Validate email and password fields and show error messages
 * call handleError(0, null) in case of error and clearEr() to remove the message
 * @param usr {string} - Email address
 * @param pw {string} - Password
 * @returns {string} - Error message
 */
const validateFields = (usr: string, pw: string): string | null => {
  const isEmailValid = validateEmail(usr);
  const isPasswordValid = validatePassword(pw);

  if (!isEmailValid && !isPasswordValid) {
    handleError(0, null);
    errors.value.push({ message: 'Credenziali non valide!', icon: 'exclamation' });
    clearEr();
    return 'error';
  } else if (!isEmailValid) {
    errors.value.push({ message: "Inserisci correttamente l'indirizzo email", icon: 'exclamation' });
    clearEr();
    return 'error';
  } else if (!isPasswordValid) {
    errors.value.push({ message: 'Inserisci correttamente la password', icon: 'exclamation' });
    clearEr();
    return 'error';
  }
  return null;
};

/**
 * Login function to authenticate the user
 * call validateFields() to validate the fields
 * call handleError(0, null) in case of error
 * call store.login() to authenticate the user
 * @param loginData {object} - User login data
 * @return {void}
 */
const login = async (): Promise<void> => {
  loading.value = true;

  const res = validateFields(loginData.value.username, loginData.value.password);
  if (res !== null) return;

  await store.login(loginData.value)
    .then(() => {
      errors.value = store.errors;
    })
    .catch((e) => {
      console.error(e);
      handleError(0, null);
    })
    .finally(() => {
      loading.value = false;
      clearEr();
    });
};

// **************** Utility functions **************** 

/**
 * Show/hide password
 * @param show_pw {boolean} - Password visibility stat
 */
const showPassword = (): void => {
  show_pw.value = !show_pw.value;
};

/**
 * Handle field errors and highlight the fields
 * @param errors {Array} - Array of errors
 */
const handleFieldErrors = (errors: ErrorObj[]): void => {
  errors.forEach((error) => {
    if (error.field === 'email') {
      const input = document.getElementById('u');
      if (input) input.classList.add('invalid');
    } else if (error.field === 'password') {
      const input = document.getElementById('p');
      if (input) input.classList.add('invalid');
    }
  });
};

/**
 * Remove toast message 
 * @param index {number} - Index of the toast to remove
 */
function handleRemoveToast(index: number): void {
  errors.value.splice(index, 1);
}

/**
 * Clear error message after a certain time
 * @param tm {number} - Timer for message removal
 */
const clearEr = (tm?: number): void => {
  setTimeout(() => {
    errors.value.shift();
  }, tm ? tm : msg_timer.value);
};

// Watch for new errors and call handleFieldErrors
watch(
  () => store.errors,
  (newErrors: ErrorObj[]) => {
    errors.value = newErrors;
    handleFieldErrors(newErrors);
  }
);

</script>

<template>
  <div class="lc">

    <!-- Toast Messages -->
    <MsgToast :errors="errors" :type="'error'" @remove-toast="handleRemoveToast" :mode="'login'" />

    <!-- Form Container -->
    <div class="lcc">

      <div class="lcf">

        <!-- LoginFormHeader -->
        <div class="lch">
          <img :src="logo" alt="Shop logo" loading="eager" />
        </div>

        <!-- LOGIN FORM -->
        <form @submit.prevent="login">

          <!-- UsernameInput -->
          <div class="lcfu">
            <label for="username" class="fl">Username</label>
            <div class="lig">
              <span class="lipt" id="ia1">
                <img src="@/assets/icons/login/envelope.svg" alt="username icon" tabindex="-1" loading="eager"
                  width="16" height="16" />
              </span>
              <input type="text" autocomplete="email" placeholder="Inserici l'username" v-model="loginData.username"
                class="fcc" id="u" name="username" :disabled="loading || store.loading" aria-describedby="username"
                @focusin="handleError(1, null)" required />
            </div>
          </div>

          <!-- PasswordInput -->
          <div class="lcfp">
            <label for="password" class="fl">Password</label>
            <div class="lig">
              <span class="lipt" id="ia2">
                <img src="@/assets/icons/login/key.svg" alt="password icon" tabindex="-1" loading="eager" width="16"
                  height="16" />
              </span>
              <input :type="show_pw ? 'text' : 'password'" id="p" name="password" class="fcc"
                placeholder="Inserisci password" :disabled="loading || store.loading" autocomplete="on"
                v-model="loginData.password" required @focusin="handleError(1, null)" />
              <button type="button" id="ia3" class="lipt" :disabled="loading || store.loading"
                @click.stop="showPassword">
                <img v-if="show_pw" src="@/assets/icons/login/eye.svg" alt="show password" loading="eager" />
                <img v-else src="@/assets/icons/login/eye-slash.svg" alt="show password" loading="eager" />
              </button>
            </div>
          </div>

          <!-- Remember Me -->
          <div class="lcfr">
            <div class="form_switch">
              <input id="remember_me" name="remember_me" type="checkbox" role="switch" class="form_check_input"
                v-model="loginData.remember" :disabled="loading || store.loading" />
              <label class="form_check_label" for="remember_me">
                Ricorda accesso
              </label>
            </div>
          </div>

          <!-- SubmitButton -->
          <div class="lcfs">
            <button id="sb" class="btc btcp" type="submit" :disabled="loading" @click="handleError(1, null)">

              <CommonSpinner v-if="loading" mode="spinner" size="sm" />

              <span role="status">{{ !loading ? 'Accedi' : 'Caricamento' }}</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.form_switch {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: .125rem;
  min-height: 1.5rem;
  padding: 1rem 0 1rem 1.5em;

  .form_check_input {
    position: relative;
    flex-shrink: 0;
    height: 1.2rem;
    width: 2.4rem;
    margin-right: .45rem;
    border: 1.5px solid #dee2e6;
    border-radius: 2rem;
    appearance: none;
    background-color: #fff;
    box-shadow: 0 0 6px -2px #0000001a;
    transition: background-position .15s ease-in-out;
    cursor: pointer;

    &:after {
      content: '';
      display: block;
      width: .85rem;
      height: .85rem;
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-115%, -50%);
      border: .1px solid #a7a7a786;
      border-radius: 50%;
      background-color: #bfbfbf;
      box-shadow: 0 0 6px -1px #0000001a;
      transition: background-color .15s ease-in-out, transform .2s ease-in-out;
    }

    &:checked {
      background-color: #1a75ff;
      border-color: #0d6efd;

      &:after {
        transform: translate(15%, -50%);
        background-color: #fff;
        border-color: #5096ff;
      }
    }

    &:focus {
      border-color: #86b7fe;
      box-shadow: 0 0 0 .25rem #0d6dfd2f;
      outline: 0;
    }
  }

  label,
  .form_check_label {
    font-weight: bold;
    cursor: pointer;
    letter-spacing: .25px;
  }
}

.lig {
  display: flex;
  flex-direction: row;
}


.fcc:focus,
.fcc.focus {
  border-color: #bcbcbc;
  outline: 0;
  box-shadow: 0 0 0 0.25rem #007bff40;
}

.fcc {
  border-radius: 6px;
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
  display: block;
  width: 100%;
  padding: .375rem .75rem;
  font-size: 1rem;
  font-weight: 400;
  line-height: 1.5;
  appearance: none;
  background-clip: padding-box;
  transition: border-color .15s ease-in-out, box-shadow .15s ease-in-out;
  border: .1rem solid hsla(0, 0%, 95%, 0.655);
}

.lipt {
  border: .1rem solid #cdcdcda7;
  border-radius: 6px;
  background-color: #f6f6f6;
  border-bottom-left-radius: 0;
  border-top-left-radius: 0;
  display: flex;
  align-items: center;
  padding: .375rem .5rem;
  font-size: 1rem;
  font-weight: 400;
  line-height: 1.5;
  text-align: center;
  white-space: nowrap;
}



#ia1,
#ia2,
#ia3,
#p {
  z-index: 100;
  border-radius: 0;
}

#ia2,
#ia1 {
  border-bottom-left-radius: 6px !important;
  border-top-left-radius: 6px !important;
}

#ia3 {
  border-bottom-right-radius: 6px !important;
  border-top-right-radius: 6px !important;
}

button:disabled,
input:disabled {
  cursor: wait;
}

.lc {
  @extend %full_wh;
  background: linear-gradient(287deg, #006699, #99CCFF, #6699CC, #74acbe, #6699CC);
  background-size: 180% 180%;
  animation: gradient-animation 9s ease infinite;

  // ************** FORM STYLES **************
  .lcc {
    @extend %full;
    @extend %fx_center;

    .lcf {
      position: relative;
      margin: auto .65rem;
      width: 100vw;
      max-width: 400px;

      @media screen and (min-width: 380px) {
        padding: 1rem;
      }

      @media screen and (min-width: 420px) {
        padding: 1.25rem;
      }

      @media screen and (min-width: 768px) {
        display: flex;
        flex-direction: column;
        padding: 1.5rem;

        // ************** FORM CONTAINER STYLES **************
        border-radius: 10px;
        border: 2px solid #ffffff1a;
        background-color: #c5c0c0e3;
        backdrop-filter: blur(10px);
        box-shadow: 0 0 40px #08071099;
        word-wrap: break-word;
      }

      @media screen and (min-width: 920px) {
        max-width: 450px;
      }

      .lig img {
        width: 16px;
        height: 16px;
      }

      .lig,
      .lch {
        margin-bottom: 1rem;
      }

      .lch {
        padding: 0 .25rem;
        text-align: center;

        img {
          width: 100%;
          height: 160px;
          max-width: 350px;

          @media screen and (min-width: 920px) {
            max-width: 400px;
          }
        }
      }

      .btc {
        @extend %fx_center;
        gap: .25rem;
        margin: .25rem auto;
        cursor: pointer;
        font-weight: bold;
        border: .1rem solid transparent;
        font-size: .9rem;
        border-radius: 6px;
        padding: .35rem .75rem;
        box-shadow: 0 0 6px -1px #c4c4c4;
        transition: scale .25s ease-in-out, box-shadow .4s ease-in-out, background-color 0.3s linear, color .3s linear;

        &:disabled {
          opacity: 0.9;
          cursor: not-allowed;
        }

        &:hover:not(:disabled) {
          box-shadow: 0 0 7px -1px #c4c4c4;
          filter: brightness(0.95);
          scale: 1.05;
        }

        @media screen and (min-width: 420px) {
          font-size: 1rem;
        }

        img,
        span {
          vertical-align: middle;
        }
      }

      .btcp {
        color: #ffffff;
        border-color: #588ce6;
        background-color: #496ad4;

        &:hover:not(:disabled) {
          color: #ffffff;
          background-color: #2449c3;
        }
      }

      form,
      form .lcfp,
      form .lcfu {
        padding: .25rem 0;
      }

      form {

        .lcfp,
        .lcfu {
          position: relative;
        }

        .lcfr {
          @extend %fx_center;
          margin-bottom: .25rem;
        }

        .lcfs {
          text-align: center;
        }

        .fl {
          margin-bottom: .5rem;
          display: block;
          color: #496ad4;
          font-weight: 700;
          letter-spacing: .5px;
          text-shadow: 0 0 .5px #c4b9b96b;
        }

        input {
          &:hover:not(:disabled) {
            filter: brightness(90%);
            transition: 0.2s linear;
          }

          &:focus {
            filter: brightness(100%);
            transition: 0.2s linear;
          }
        }
      }
    }
  }
}

// ************** Form Validation **************
.invalid {
  border-color: #a91826 !important;
  box-shadow: 0 0 6px rgba(157, 0, 0, 0.5);

  &::placeholder {
    color: red;
  }
}

// ************** ANIMATIONS **************

// Shake animation
.shake {
  animation: shake-horizontal 0.8s cubic-bezier(0.455, 0.030, 0.515, 0.955) both;
}

@keyframes shake-horizontal {

  0%,
  100% {
    transform: translateX(0);
  }

  10%,
  30%,
  50%,
  70% {
    transform: translateX(-10px);
  }

  20%,
  40%,
  60% {
    transform: translateX(10px);
  }

  80% {
    transform: translateX(8px);
  }

  90% {
    transform: translateX(-8px);
  }
}

@keyframes gradient-animation {
  0% {
    background-position: 0% 50%;
  }

  50% {
    background-position: 100% 50%;
  }

  100% {
    background-position: 0% 50%;
  }
}
</style>
