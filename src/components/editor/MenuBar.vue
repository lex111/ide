<template>
  <div class="wrapper" @keydown="keyShortCuts">
    <div id="fs_control">
      <div class="panel panel-default">
        <div class="headPanel panel-heading">
          <div class="btn-group">
            <button id="submit" type="button" class="btn btn-sm btn-run" :class="{ loading : disabled }"
                    @click="runCode()" :disabled="loading">
              <i class="fa fa-play" aria-hidden="true"></i>
              <span v-if="loading">Running</span>
              <span v-else> Run </span>
            </button>
            <language :options=languages :selected=this.$store.state.language></language>

            <button class="btn btn-sm btn-menu">
            <router-link class="decoration-none" to="/" target="_blank" active-class="" exact-active-class="">
              New <i class="fa fa-file-code-o" aria-hidden="true"></i>
            </router-link>
            </button>

            <button type="button" id="custInp" class="btn btn-sm btn-menu" @click="InOutBoxToggle()">
              Input <i class="fa fa-keyboard-o" aria-hidden="true"></i>
            </button>
            <button type="button" id="save" class="btn btn-sm btn-menu" @click="saveToServer()">Save <i
              class="fa fa-floppy-o" aria-hidden="true"></i></button>
            <button type="button" id="download" class="btn btn-sm btn-menu" @click="showDownloadModal()">
              Download
              <i class="fa fa-download" aria-hidden="true"></i>
            </button>
            <input type="file" ref="fileUpload" style="display:none" @change="uploadCode">
            <button type="button" id="uploadFile" class=" btn btn-sm btn-menu" @click="selectFile">
              Upload <span class="fa fa-folder-open" aria-hidden="true"></span>
            </button>
            <input type="file" id="upload" style="display:none;">
            <button type="button" id="settingButton" class="btn btn-sm btn-menu" @click="settingsToggle">
              Setting <span class="fa fa-cog"></span>
            </button>
            <share></share>
            <button id="panelLang" type="button" class="btn btn-sm btn-menu" @click="showShortcutsModal()">
              Shortcuts<i class="fa fa-reply-all" aria-hidden="true"></i>
            </button>
          </div>
          <div class="logoMenu">
            <login-button></login-button>
            Made with <i class="fa fa-heart" aria-hidden="true" style="color: #e31d3b"></i> by
            <img src="../../assets/cb_logo_light.png">
          </div>
        </div>
        <div class="panel-heading second-row">
          Title: <input class="black" type="text" placeholder="Untitled" :value=this.$store.state.codeTitle @change=changeTitle>
        </div>
      </div>
      <settings v-show="this.$store.state.showSettings"></settings>
    </div>

    <modal name="download-modal" transition="pop-out" :width="680" :pivot-y="0.2" :height="auto">
      <div class="download-modal-title flex-center">
        confirm file name
      </div>
      <div class="download-modal-content flex-center">
        <span>File Name:</span>
        <input v-on:keyup.enter="downloadCode" v-on:change="updateFileName"
              ref="fileName" :value="this.$store.state.fileName" placeholder="Enter File name">
      </div>
      <div class="download-modal-button-set flex-space-between">
        <button class="modal-button" @click="closeDownloadModal()">close</button>
        <button class="modal-button" @click="resetFileName()">reset file name</button>
        <button class="modal-button" @click="saveFileName()">save file name</button>
        <button class="modal-button" @click="downloadCode()">download code</button>
      </div>
    </modal>

    <modal name="shortcuts-modal" transition="pop-out" :width="600" :pivot-y="0.3" :height="500">
      <div class="shortcuts-modal-title flex-center">
        keyboard shortcuts
        <span @click="closeShortcutsModal()" class="shortcuts-modal-close">×</span>
      </div>
      <ul class="shortcuts-modal-content">
        <li class="key-unit flex-space-between">
          <span class="key-span flex-center">Ctrl + I</span>
          <span class="key-description">To run the program in windows/linux</span>
        </li>
        <li class="key-unit flex-space-between">
          <span class="key-span flex-center">⌘ + I</span>
          <span class="key-description">To run the program in mac</span>
        </li>
        <li class="key-unit flex-space-between">
          <span class="key-span flex-center">Ctrl + U</span>
          <span class="key-description">To reset the settings in windows/linux</span>
        </li>
        <li class="key-unit flex-space-between">
          <span class="key-span flex-center">⌘ + U</span>
          <span class="key-description">To reset the settings in mac</span>
        </li>
        <li class="key-unit flex-space-between">
          <span class="key-span flex-center">Ctrl + B</span>
          <span class="key-description">To reset the code in windows/linux</span>
        </li>
        <li class="key-unit flex-space-between">
          <span class="key-span flex-center">⌘ + B</span>
          <span class="key-description">To reset the code in mac</span>
        </li>
        <li class="key-unit flex-space-between">
          <span class="key-span flex-center">Ctrl + S</span>
          <span class="key-description">To download the code in windows/linux</span>
        </li>
        <li class="key-unit flex-space-between">
          <span class="key-span flex-center">⌘ + S</span>
          <span class="key-description">To download the code in mac</span>
        </li>
      </ul>
    </modal>
  </div>
</template>

<script>
  import language from './Language.vue'
  import Vue from 'vue'
  import base64 from 'base-64'
  import Settings from './Settings.vue'
  import Share from './Share.vue'
  import LoginButton from '../auth/LoginButton.vue'
  import * as download from 'downloadjs'
  export default {
    name: 'menuBar',
    components: {language, Settings, Share, LoginButton},
    data() {
      return {
        languages: ['C', 'C++', 'C#', 'Java', 'Python', 'Python 3', 'JavaScript', 'Node.js', 'Ruby'],
        fullscreen: false,
        loading: false,
        fileName: this.$store.state.fileName
      }
    },
    methods: {
      runCode() {
        this.loading = !this.loading
        this.$store.dispatch('runCode').then((data) => {
          if (!this.$store.state.showInOutBox)
            this.$store.commit('toggleInOutBox')
          this.loading = false
          if (data.result == 'compile_error') {
            this.$notify({
              text: 'Compilation Error',
              type: 'error'
            })
          } else if (data.result == 'success') {
            if (data.data.testcases[0].result == 'run-error') {
              this.$notify({
                text: 'Runtime Error',
                type: 'error'
              })
            } else {
              this.$notify({
                text: 'Code Compiled Successfully',
                type: 'success'
              })
            }
          }
        }).catch(err => {
          console.error(err)
          this.loading = false
          this.$notify({
            text: 'There was some error while running the code, please try again.',
            type: 'error'
          })
        })
      },
      saveToServer() {
        this.$store.dispatch('saveDataToServer')
          .then(({data}) => {
            this.$notify({
              text: 'Code saved to server',
              type: 'success'
            })
            return this.$router.push({name: 'saved', params: {id: data.id}})
          })
      },
      InOutBoxToggle() {
        this.$store.commit('toggleInOutBox')
      },
      settingsToggle() {
        this.$store.commit('toogleSettings')
      },
      selectFile() {
        // open file select dialogue
        this.$refs.fileUpload.click()
      },
      showDownloadModal() {
        this.$modal.show('download-modal')
        setTimeout(() => {
          this.$refs.fileName.select()
        }, 200)
      },
      closeDownloadModal() {
        this.$modal.hide('download-modal')
        this.$data.fileName = this.$store.state.fileName
      },
      updateFileName(e) {
        e.preventDefault()
        this.$data.fileName = e.target.value
      },
      resetFileName() {
        this.$store.commit('changeLanguage', this.$store.state.language)
        this.$refs.fileName.value = this.$data.fileName = this.$store.state.fileName
        this.$refs.fileName.select()
      },
      saveFileName() {
        this.$store.commit('fileNameChange', this.$data.fileName)
        this.$modal.hide('download-modal')
      },
      downloadCode() {
        this.saveFileName()
        const code = this.$store.state.code[this.$store.state.language]
        download(`data:text/plain;charset=utf-8,${encodeURIComponent(code)}`, this.$store.state.fileName, 'text/plain')
      },
      uploadCode(e) {
        const files = e.target.files || e.dataTransfer.files
        if (!files.length) {
          return
        }

        const file = files[0]
        const reader = new FileReader()

        reader.onload = (e) => {
          console.log('Uploaded File: ' + file.name)
          this.$notify({
            text: 'Code Uploaded Successfully',
            type: 'success'
          })
          this.$store.commit('uploadCode', e.target.result)
          this.$store.commit('fileNameChange', file.name)
          this.$refs.fileUpload.value = ""
        }
        reader.readAsText(file)
      },
      showShortcutsModal() {
        this.$modal.show('shortcuts-modal')
      },
      closeShortcutsModal() {
        this.$modal.hide('shortcuts-modal')
      },
      keyShortCuts(e) {
        const isMacLike = navigator.platform.match(/(Mac|iPad)/i) ? true : false
        const isMetaOrCtrlDown = ((isMacLike && e.metaKey) || e.ctrlKey)
        if(isMetaOrCtrlDown && e.keyCode === 73) {
          e.preventDefault()
          this.runCode()
        }
        if(isMetaOrCtrlDown && e.keyCode === 85) {
          e.preventDefault()
          this.$store.commit('resetEditor')
        }
        if(isMetaOrCtrlDown && e.keyCode === 83) {
          e.preventDefault()
          this.showDownloadModal()
        }
        if(isMetaOrCtrlDown && e.keyCode === 66) {
          e.preventDefault()
          this.$store.commit('resetCode', this.$store.state.language)
        }
      },
      changeTitle (e) {
        this.$store.commit('setCodeTitle', e.target.value)
      }
    }
  }
</script>

<style scoped>
  #fs_control {
    position: relative;
    z-index: 20;
  }

  .panel {
    width: 100vw;
    height: 40px;
    margin: 0;
    border: none;
    border-bottom: 1px;
  }

  .panel-heading {
    padding: 0 15px;
    background: #202020;
    color: #fff;
    border-color: #272727;
  }

  .logoMenu {
    float: right;
    font-weight: 700;
    text-transform: uppercase;
  }

  .logoMenu img {
    height: 40px;
  }

  @media (max-width: 877px) {
    .logoMenu {
      display: none;
    }
  }
</style>

<style>
  .btn-run {
    background: #e31d3b;
    border-radius: 50px !important;
    color: white !important;
  }

  .btn-run:hover, .btn-run:focus, .btn-run:active {
    box-shadow: none !important;
  }

  .modal-mask {
    position: fixed;
    z-index: 9998;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, .5);
    display: table;
    transition: opacity .3s ease;
  }

  .modal-wrapper {
    display: table-cell;
    vertical-align: middle;
    color: black;
  }

  .modal-container {
    width: 45vw;
    margin: 0px auto;
    padding: 10px 30px 30px 30px;
    background-color: #fff;
    border-radius: 3px !important;
    box-shadow: 0 2px 8px rgba(0, 0, 0, .33);
    transition: all .3s ease;
    font-family: Helvetica, Arial, sans-serif;
  }

  .modal-header {
    padding: 15px 25px !important;
  }

  .modal-footer {
    padding: 15px 0 0 0;
  }

  .modal-header h3 {
    margin-top: 0;
    margin-bottom: 0;
    font-weight: 400;
  }

  .modal-body {
    margin: 5px 0;
    font-size: 15px;
  }

  .modal-default-button {
    float: right;
  }

  .modal-footer button {
    color: white;
  }

  .modal-body ul li kbd {
    display: inline-block;
    margin: 0 .1em;
    padding: .2em 1em;
    font-family: Arial, "Helvetica Neue", Helvetica, sans-serif;
    font-size: 10px;
    line-height: 1.4;
    color: #242729;
    text-shadow: 0 1px 0 #FFF;
    background-color: #e1e3e5;
    border: 1px solid #adb3b9;
    border-radius: 3px;
    box-shadow: 0 1px 0 rgba(12, 13, 14, 0.2), 0 0 0 2px #FFF inset;
  }

  .flex-center {
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .flex-space-between {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .download-modal-title {
    height: 60px;
    font-size: 24px;
    font-weight: 500;
  }

  .download-modal-content,
  .download-modal-title,
  .download-modal-button-set {
    letter-spacing: 1px;
    padding: 8px;
    text-transform: uppercase;
  }

  .download-modal-button-set .modal-button {
    font-size: 16px;
    text-transform: uppercase;
    color: #8b8c8d;
    background: white;
    border-radius: 4px;
    box-sizing: border-box;
    padding: 10px;
    min-width: 100px;
    margin: 4px;
    cursor: pointer;
    border: 1px solid #b4b4b4;
    transition: 0.1s all;
    outline: none;
  }

  .download-modal-button-set .modal-button:hover {
    border: 1px solid #181818;
    color: #181818;
  }

  .download-modal-button-set {
    position: absolute;
    bottom: 0;
    width: 100%;
    height: 80px;
  }

  .download-modal-title {
    border-bottom: 2px solid #ccc;
  }

  .download-modal-content {
    height: calc(100% - 140px);
  }

  .download-modal-content input {
    display: block;
    box-sizing: border-box;
    margin-bottom: 4px;
    padding: 8px;
    margin: 0 8px;
    width: 280px;
    font-size: 16px;
    border: 0;
    border-bottom: 1px solid #b4b4b4;
    color: #b4b4b4;
    font-family: inherit;
    transition: 0.5s all;
    outline: none;
  }

  .download-modal-content input:focus {
    border-bottom: 1px solid #181818;
    color: #181818;
  }

  .shortcuts-modal-title,
  .shortcuts-modal-content {
    padding: 8px;
    color: #b4b4b4;
  }

  .shortcuts-modal-content {
    height: calc(100% - 60px);
    overflow-y: auto;
  }

  .shortcuts-modal-title {
    font-size: 24px;
    font-weight: 500;
    text-transform: uppercase;
    height: 60px;
    border-bottom: 2px solid #ccc;
  }

  .shortcuts-modal-content {
    font-size: 16px;
    font-weight: 400;
  }

  .key-span {
    color: #555;
    text-align: center;
    background-color: #eee;
    display: inline-block;
    border-radius: 4px;
    border: 1px solid #ccc;
    box-shadow: inset 0 1px 0 #fff, 0 1px 0 #ccc;
    font-size: 20px;
    padding: 4px 8px;
    margin: 0 8px;
  }

  .key-unit {
    text-transform: uppercase;
    width: calc(100% - 16px);
    margin: 8px;
  }

  .shortcuts-modal-close {
    position: absolute;
    right: 15px;
    top: 15px;
    font-size: 40px;
    font-weight: 500;
    cursor: pointer;
  }

  .shortcuts-modal-close:hover {
    color: #181818;
  }

  .decoration-none {
    color: unset
  }
  .decoration-none:hover {
    color: #fc4f4f
  }
  .second-row {
    padding: 0px 25px !important;
    font-family: sans-serif;
    font-weight: 600;
    font-size: 1.05rem;
  }
  .second-row input {
    margin-bottom: 5px;
  }
</style>
