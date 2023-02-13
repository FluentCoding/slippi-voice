<script lang="ts">
  import ConnectionStateComponent from "./components/ConnectionStateComponent.svelte";
  import { ConnectionState } from "./types";
  import Description from './static/Description.svelte'
  import { startDolphin } from "./util/dolphin";
  import { SvelteToast, type SvelteToastOptions } from '@zerodevx/svelte-toast'
  import { IPCHandler } from './util/ipc'

  const toastOptions: SvelteToastOptions = {
    duration: 5000
  }

  let connectionState: ConnectionState = ConnectionState.CONNECTING;
  let startNetplayLock = false;

  IPCHandler.on("connection_status", (status) => {
    connectionState = status;
  })

  let startNetplay = async () => {
    startNetplayLock = true;
    connectionState = ConnectionState.CONNECTING;
    try {
      await startDolphin();
    } finally {
      startNetplayLock = false
    }
  };

  /*const dolphinConnection = new DolphinConnection();
  dolphinConnection
    .connect("localhost", Ports.DEFAULT)
    .then(() => {
      console.log("Successfully connected!");
      startNetplayLock = true;
      connectionState = ConnectionState.CONNECTED;
    })
    .catch(console.error);
  
  dolphinConnection.on("statusChange", (status) => {
    if (status === SlippiConnectionStatus.DISCONNECTED) {
      startNetplayLock = false;
      connectionState = ConnectionState.NOT_CONNECTED;
    }
  })*/
</script>

<SvelteToast options={toastOptions} />
<main class="bg-slate-600 text-white min-h-screen p-5 flex flex-col">
  <div class="text-4xl text-center">Slippi+</div>
  <div class="text-base text-center text-gray-200 mt-5">
    <Description />
  </div>
  <div class="flex-auto" />
  <div class="text-center flex flex-col gap-2">
    <button disabled={startNetplayLock} on:click={startNetplay} class={`text-sm bg-gray-800 w-full py-4 rounded-xl border-2 disabled:opacity-50 enabled:hover:border-green-300`}>
      Start netplay
    </button>
    <ConnectionStateComponent state={connectionState} />
  </div>
</main>