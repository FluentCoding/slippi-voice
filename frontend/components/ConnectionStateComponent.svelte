<script lang="ts">
  import { ConnectionState } from "../types";

  export let state: ConnectionState;

  const connectionStateConfig = {
    [ConnectionState.NOT_CONNECTED]: {
      title: "Not connected to dolphin",
      color: "border-red-400"
    },
    [ConnectionState.CONNECTING]: {
      title: "Connecting",
      color: "border-yellow-400"
    },
    [ConnectionState.CONNECTED]: {
      title: "Connected",
      color: "border-emerald-400"
    }
  }

  let title: String, color: String, connectingDotsAmount: number;
  $: {
    title = connectionStateConfig[state]?.title;
    color = connectionStateConfig[state]?.color;
    connectingDotsAmount = 0;
  }

  setInterval(() => {
    if (state === ConnectionState.CONNECTING) {
      connectingDotsAmount = (connectingDotsAmount + 1) % 4;
      title = `${connectionStateConfig[state]?.title}${Array(connectingDotsAmount).fill('.').join('')}`;
    }
  }, 500);
</script>
  
<div class={`transition-all text-sm bg-gray-800 w-full py-4 rounded-xl border-2 ${color}`}>
  {title}
</div>