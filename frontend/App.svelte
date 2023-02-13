<script lang="ts">
  import ConnectionStateComponent from "./components/ConnectionStateComponent.svelte";
  import { ConnectionState } from "./types";
  import Description from './static/Description.svelte'
  import { SvelteToast, type SvelteToastOptions } from '@zerodevx/svelte-toast'
  import { IPCHandler } from './api/ipc'
  import { AudioManager } from './util/audio'

  const audioManager = new AudioManager();
  const toastOptions: SvelteToastOptions = {
    duration: 5000
  }

  let connectionState: ConnectionState = ConnectionState.CONNECTING;
  //let startNetplayLock = false;

  IPCHandler.on("connection_status", (status) => {
    connectionState = status;
  })
</script>

<SvelteToast options={toastOptions} />
<main class="bg-slate-600 text-white min-h-screen p-5 flex flex-col">
  <div class="text-4xl text-center">Slippi+</div>
  <div class="text-base text-center text-gray-200 mt-5">
    <Description />
  </div>
  <div class="flex-auto" />
  <div class="text-center flex flex-col gap-2">
    <ConnectionStateComponent state={connectionState} />
  </div>
</main>