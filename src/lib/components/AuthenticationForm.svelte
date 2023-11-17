<script lang="ts">
	// Props
	/** Exposes parent props to this component. */
	export let parent: any;

	// Imports
	import { modalStore, TabGroup, Tab } from '@skeletonlabs/skeleton';
	import { applyAction, enhance, type SubmitFunction } from '$app/forms';
	import { onMount } from 'svelte';
	import { invalidate } from '$app/navigation';
	import { toastStore } from '@skeletonlabs/skeleton';
	import { page } from '$app/stores';
	import StatusMessage from './StatusMessage.svelte';
	import { goto } from '$app/navigation';

	let tabSet: number = $modalStore[0].meta.tabSet ?? 0;
	let redirect: string = $modalStore[0].meta.redirect ?? undefined;

	const form: {
		email: string;
		password: string;
		loading: boolean;
		error: string | null;
		success: string | null;
	} = {
		email: '',
		password: '',
		loading: false,
		error: null,
		success: null
	};

	const handleSubmit: SubmitFunction = () => {
		form.loading = true;
		return async ({ result }) => {
			if (result.type === 'failure') {
				form.error = result.data?.error;
			}

			if (result.type === 'success') {
				if (result.data?.login) {
					await invalidate('supabase:auth');
					parent.onClose();
					toastStore.trigger({
						message: 'Welcome back, ' + $page.data.session?.user.email + '!',
						background: 'variant-filled-success'
					});

					if (redirect) {
						goto(redirect);
					}
				} else {
					form.success = result.data?.message;
				}
			}

			await applyAction(result);
			form.loading = false;
		};
	};

	onMount(async () => {
		form.email = '';
		form.password = '';
		form.loading = false;
		form.error = null;
		form.success = null;
	});
</script>

<!-- @component This example creates a simple form modal. -->

{#if $modalStore[0]}
	<div class="modal-example-form card p-4 w-modal-slim shadow-xl space-y-4">
		<!-- <header class='text-2xl font-bold'>{$modalStore[0].title ?? '(title missing)'}</header>
		<article>{$modalStore[0].body ?? '(body missing)'}</article> -->
		<div class="flex flex-row justify-center items-center mb-4">
			<div>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="42"
					height="42"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
					class="lucide-icon lucide lucide-user-2"
					><circle cx="12" cy="8" r="5" /><path d="M20 21a8 8 0 1 0-16 0" /></svg
				>
			</div>
		</div>

		<TabGroup hover="hover:variant-soft-primary" justify="justify-center">
			<Tab bind:group={tabSet} name="tab1" value={0}>Sign In</Tab>
			<Tab bind:group={tabSet} name="tab2" value={1}>Sign Up</Tab>
			<!-- Tab Panels --->
			<svelte:fragment slot="panel">
				{#if tabSet === 0}
					{#if form.success}
						<StatusMessage message={form.success} />
					{:else if form.error}
						<StatusMessage message={form.error} error={true} />
					{/if}
					<form
						class="px-3 modal-form space-y-4 rounded-container-token"
						method="POST"
						use:enhance={handleSubmit}
						autocomplete="off"
					>
						<label class="label">
							<span>Email</span>
							<input
								class="input"
								type="email"
								name="email"
								value={form.password}
								placeholder="Enter email..."
							/>
						</label>
						<label class="label">
							<span>Password</span>
							<input
								class="input"
								type="password"
								name="password"
								value={form.password}
								placeholder="Enter password..."
							/>
						</label>

						<footer class="modal-footer w-full">
							<!-- <button
								class="btn {parent.buttonNeutral}"
								on:click|preventDefault={parent.onClose}
								type="button">{parent.buttonTextCancel}</button
							> -->
							<button
								class="btn {parent.buttonPositive} w-full"
								disabled={form.loading}
								formaction="/.?/login"
								type="submit">Sign In</button
							>
						</footer>

						<span class="flex items-center py-1 px-[1rem]">
							<span class="h-[1px] w-full bg-surface-300-600-token" />
							<p class="px-2">or</p>
							<span class="h-[1px] w-full bg-surface-300-600-token" />
						</span>

						<form class="flex flex-col gap-2 pb-2" method="POST" use:enhance={handleSubmit}>
							<button
								class="btn variant-ringed-surface flex gap-2"
								formaction="/.?/loginOAuth&amp;provider=google"
							>
								<svg
									class="w-7 aspect-square"
									viewBox="0 0 32 32"
									fill="none"
									xmlns="http://www.w3.org/2000/svg"
								>
									<path
										d="M30.0014 16.3109C30.0014 15.1598 29.9061 14.3198 29.6998 13.4487H16.2871V18.6442H24.1601C24.0014 19.9354 23.1442 21.8798 21.2394 23.1864L21.2127 23.3604L25.4536 26.58L25.7474 26.6087C28.4458 24.1665 30.0014 20.5731 30.0014 16.3109Z"
										fill="#4285F4"
										data-darkreader-inline-fill=""
										style="--darkreader-inline-fill: #4ba0f4;"
									/>
									<path
										d="M16.2863 29.9998C20.1434 29.9998 23.3814 28.7553 25.7466 26.6086L21.2386 23.1863C20.0323 24.0108 18.4132 24.5863 16.2863 24.5863C12.5086 24.5863 9.30225 22.1441 8.15929 18.7686L7.99176 18.7825L3.58208 22.127L3.52441 22.2841C5.87359 26.8574 10.699 29.9998 16.2863 29.9998Z"
										fill="#34A853"
										data-darkreader-inline-fill=""
										style="--darkreader-inline-fill: #62cf7f;"
									/>
									<path
										d="M8.15964 18.769C7.85806 17.8979 7.68352 16.9645 7.68352 16.0001C7.68352 15.0356 7.85806 14.1023 8.14377 13.2312L8.13578 13.0456L3.67083 9.64746L3.52475 9.71556C2.55654 11.6134 2.00098 13.7445 2.00098 16.0001C2.00098 18.2556 2.55654 20.3867 3.52475 22.2845L8.15964 18.769Z"
										fill="#FBBC05"
										data-darkreader-inline-fill=""
										style="--darkreader-inline-fill: #fbc31e;"
									/>
									<path
										d="M16.2864 7.4133C18.9689 7.4133 20.7784 8.54885 21.8102 9.4978L25.8419 5.64C23.3658 3.38445 20.1435 2 16.2864 2C10.699 2 5.8736 5.1422 3.52441 9.71549L8.14345 13.2311C9.30229 9.85555 12.5086 7.4133 16.2864 7.4133Z"
										fill="#EB4335"
										data-darkreader-inline-fill=""
										style="--darkreader-inline-fill: #ec5043;"
									/>
								</svg>
								Sign in with Google
							</button>
							<button
								class="btn variant-ringed-surface flex gap-2"
								formaction="/.?/loginOAuth&amp;provider=discord"
							>
								<svg
									class="w-7 aspect-square"
									viewBox="0 0 1024 1024"
									xmlns="http://www.w3.org/2000/svg"
								>
									<circle
										cx="512"
										cy="512"
										r="512"
										style="fill: rgb(88, 101, 242); --darkreader-inline-fill: #5b97f2;"
										data-darkreader-inline-fill=""
									/>
									<path
										d="M689.43 349a422.21 422.21 0 0 0-104.22-32.32 1.58 1.58 0 0 0-1.68.79 294.11 294.11 0 0 0-13 26.66 389.78 389.78 0 0 0-117.05 0 269.75 269.75 0 0 0-13.18-26.66 1.64 1.64 0 0 0-1.68-.79A421 421 0 0 0 334.44 349a1.49 1.49 0 0 0-.69.59c-66.37 99.17-84.55 195.9-75.63 291.41a1.76 1.76 0 0 0 .67 1.2 424.58 424.58 0 0 0 127.85 64.63 1.66 1.66 0 0 0 1.8-.59 303.45 303.45 0 0 0 26.15-42.54 1.62 1.62 0 0 0-.89-2.25 279.6 279.6 0 0 1-39.94-19 1.64 1.64 0 0 1-.16-2.72c2.68-2 5.37-4.1 7.93-6.22a1.58 1.58 0 0 1 1.65-.22c83.79 38.26 174.51 38.26 257.31 0a1.58 1.58 0 0 1 1.68.2c2.56 2.11 5.25 4.23 8 6.24a1.64 1.64 0 0 1-.14 2.72 262.37 262.37 0 0 1-40 19 1.63 1.63 0 0 0-.87 2.28 340.72 340.72 0 0 0 26.13 42.52 1.62 1.62 0 0 0 1.8.61 423.17 423.17 0 0 0 128-64.63 1.64 1.64 0 0 0 .67-1.18c10.68-110.44-17.88-206.38-75.7-291.42a1.3 1.3 0 0 0-.63-.63zM427.09 582.85c-25.23 0-46-23.16-46-51.6s20.38-51.6 46-51.6c25.83 0 46.42 23.36 46 51.6.02 28.44-20.37 51.6-46 51.6zm170.13 0c-25.23 0-46-23.16-46-51.6s20.38-51.6 46-51.6c25.83 0 46.42 23.36 46 51.6.01 28.44-20.17 51.6-46 51.6z"
										style="fill: rgb(255, 255, 255); --darkreader-inline-fill: #e8e6e3;"
										data-darkreader-inline-fill=""
									/>
								</svg>
								Sign in with Discord
							</button>
						</form>
					</form>
				{:else if tabSet === 1}
					{#if form.success}
						<StatusMessage message={form.success} />
					{:else if form.error}
						<StatusMessage message={form.error} error={true} />
					{/if}
					<form
						class="px-3 modal-form space-y-4 rounded-container-token"
						method="POST"
						use:enhance={handleSubmit}
						autocomplete="off"
					>
						<label class="label">
							<span>Email</span>
							<input
								class="input"
								type="email"
								name="email"
								value={form.password}
								placeholder="Enter email..."
							/>
						</label>
						<label class="label">
							<span>Password</span>
							<input
								class="input"
								type="password"
								name="password"
								value={form.password}
								placeholder="Enter password..."
							/>
						</label>

						<footer class="modal-footer {parent.regionFooter}">
							<button
								class="btn {parent.buttonNeutral}"
								on:click|preventDefault={parent.onClose}
								type="button">{parent.buttonTextCancel}</button
							>
							<button
								class="btn {parent.buttonPositive}"
								disabled={form.loading}
								formaction="/.?/register"
								type="submit">Sign up</button
							>
						</footer>
					</form>
				{:else if tabSet === 2}
					(tab panel 3 contents)
				{/if}
			</svelte:fragment>
		</TabGroup>
	</div>
{/if}
