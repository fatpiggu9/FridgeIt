<script lang="ts">
	import Icon from 'svelte-awesome';
	import warning from 'svelte-awesome/icons/warning';
	import check from 'svelte-awesome/icons/check';

	export let message: string;
    export let error: boolean = false;
</script>

{#if !error}
	<aside class="alert variant-filled-success mb-5">
		<!-- Icon -->
		<Icon data={check} scale={2} />
		<!-- Message -->
		<div class="alert-message">
			<p>{message}</p>
		</div>
	</aside>
{:else}
	<aside class="alert variant-filled-error mb-2">
		<!-- Icon -->
		<Icon data={warning} scale={2} />
		<!-- Message -->
		<div class="alert-message">
			<p>{message}</p>
		</div>
	</aside>
{/if}
