<script lang="ts">
	// The ordering of these imports is critical to your app working properly
	import '@skeletonlabs/skeleton/themes/theme-hamlindigo.css';
	// If you have source.organizeImports set to true in VSCode, then it will auto change this ordering
	import '@skeletonlabs/skeleton/styles/all.css';
	// Most of your app wide CSS should be put in this file
	import '../app.postcss';
	import { AppShell, AppBar, popup } from '@skeletonlabs/skeleton';
	import { Modal, modalStore } from '@skeletonlabs/skeleton';
	import type { ModalSettings, ModalComponent } from '@skeletonlabs/skeleton';
	import AuthenticationForm from '$lib/components/AuthenticationForm.svelte';
	import { page } from '$app/stores';
	import { applyAction, enhance, type SubmitFunction } from '$app/forms';
	import { setContext } from 'svelte';

	import { Toast, toastStore } from '@skeletonlabs/skeleton';
	import type { ToastSettings } from '@skeletonlabs/skeleton';
	import { Drawer, drawerStore } from '@skeletonlabs/skeleton';
	import { Accordion, AccordionItem } from '@skeletonlabs/skeleton';
	import { Stepper, Step } from '@skeletonlabs/skeleton';
	import Icon from 'svelte-awesome';
	import shoppingBasket from 'svelte-awesome/icons/shoppingBasket';
	import listOl from 'svelte-awesome/icons/listOl';
	import cutlery from 'svelte-awesome/icons/cutlery';
	import clock from 'svelte-awesome/icons/clockO';
	import { Avatar } from '@skeletonlabs/skeleton';
	import book from 'svelte-awesome/icons/book';
	import home from 'svelte-awesome/icons/home';
	import { goto } from '$app/navigation';
	import edit from 'svelte-awesome/icons/edit';
	import user from 'svelte-awesome/icons/user';
	import { invalidate } from '$app/navigation';
	import { onMount } from 'svelte';
	import type { LayoutData } from './$types';
	import signOut from 'svelte-awesome/icons/signOut';
	import signIn from 'svelte-awesome/icons/signIn';
	import infoCircle from 'svelte-awesome/icons/infoCircle';
	import logo from '$lib/assets/wtf.png';

	import chevronDown from 'svelte-awesome/icons/chevronDown';
	import { computePosition, autoUpdate, offset, shift, flip, arrow } from '@floating-ui/dom';
	import { storePopup } from '@skeletonlabs/skeleton';
	import refrigerator from '$lib/assets/fridge-icon.svg';
	import { redirect } from '@sveltejs/kit';
	

	storePopup.set({ computePosition, autoUpdate, offset, shift, flip, arrow });

	export let data: LayoutData;

	$: ({ supabase, session } = data);
	$: username = session?.user?.email?.split('@')[0];
	$: logoDisplayClass = $page.url.pathname === '/' ? 'hidden' : 'block';

	onMount(() => {
		const {
			data: { subscription }
		} = supabase.auth.onAuthStateChange((event, _session) => {
			if (_session?.expires_at !== session?.expires_at) {
				invalidate('supabase:auth');
			}
		});

		return () => subscription.unsubscribe();
	});

	const navigateToDashboard = () => {
		if (session?.user) goto('/dashboard');
		else {
			toastStore.trigger({
				message: 'Sign in to access the dashboard',
				background: 'variant-filled-warning',
				action: {
					label: 'Sign In',
					response: () => showModalAuth('/dashboard'),
				}
			});			
		}
	};

	const showModalAuth = (redirect: string | undefined = undefined) => {
		const c: ModalComponent = {
			ref: AuthenticationForm,
			slot: ''
		};
		const modal: ModalSettings = {
			type: 'component',
			component: c,
			meta: { tabSet: 0, redirect: redirect }
		};
		modalStore.trigger(modal);
	};

	let loading: boolean = false;
	const handleLogout: SubmitFunction = () => {
		loading = true;
		return async ({ result }) => {
			if (result.type === 'redirect') {
				await invalidate('supabase:auth');
				toastStore.trigger({
					message: 'You have been logged out successfully',
					background: 'variant-filled-secondary'
				});
			} else {
				await applyAction(result);
			}
			loading = false;
		};
	};

	const removePlaceholder = (e: any) => {
		const placeholder = e.target.parentElement;
		placeholder.removeAttribute('data-placeholder');
	};

	const onCompleteHandler = () => {
		const t: ToastSettings = {
			message: 'Congratulations, you have made it to the final step. Enjoy your meal!',
			background: 'variant-filled-success'
		};

		toastStore.trigger(t);
	};

	setContext('authentication', { showModalAuth });
</script>

<Modal />
<Toast />
<Drawer>
	{#if $drawerStore.id === 'recipe'}
		<div class="w-full h-full space-y-5">
			<div
				data-placeholder
				class="overflow-hidden relative bg-gray-200 w-full h-[17rem]"
				style="min-height: 15rem;"
			>
				<img
					src={$drawerStore.meta.recipeDetail.image}
					class="object-cover w-full h-full"
					alt={$drawerStore.meta.recipeDetail.title}
					on:load={removePlaceholder}
				/>
			</div>
			<div class="w-full px-3">
				<div class="text-center">
					<h2 class="mb-3">{$drawerStore.meta.recipeDetail.title}</h2>
					<span class="badge variant-filled"
						><Icon data={clock} class="mr-2" />
						{$drawerStore.meta.recipeDetail.readyInMinutes} minutes</span
					>
				</div>
				<Accordion>
					<AccordionItem open>
						<svelte:fragment slot="lead"><Icon data={book} /></svelte:fragment>
						<svelte:fragment slot="summary">Summary</svelte:fragment>
						<svelte:fragment slot="content">
							<div class="text-sm text-justify">
								{@html $drawerStore.meta.recipeDetail.summary}
							</div>
						</svelte:fragment>
					</AccordionItem>
					<AccordionItem open>
						<svelte:fragment slot="lead"><Icon data={shoppingBasket} /></svelte:fragment>
						<svelte:fragment slot="summary">Ingredients</svelte:fragment>
						<svelte:fragment slot="content">
							<dl class="list-dl">
								{#each $drawerStore.meta.recipeDetail.extendedIngredients as ingredient}
									<div>
										<span class="bg-gray-200">
											<Avatar
												src="https://spoonacular.com/cdn/ingredients_100x100/{ingredient.image}"
												width="w-12"
											/>
										</span>
										<span class="flex-auto">
											<dt class="font-bold">{ingredient.nameClean}</dt>
											<dd class="text-sm opacity-50">{ingredient.amount} {ingredient.unit}</dd>
										</span>
										<span>⋮</span>
									</div>
								{/each}
							</dl>
						</svelte:fragment>
					</AccordionItem>
					<!-- <AccordionItem open={$drawerStore.meta.recipeEquipments.length}>
						<svelte:fragment slot="lead"><Icon data={cutlery} /></svelte:fragment>
						<svelte:fragment slot="summary">Equipment</svelte:fragment>
						<svelte:fragment slot="content">
							<dl class="list-dl">
								{#if $drawerStore.meta.recipeEquipments.length}
									{#each $drawerStore.meta.recipeEquipments as equipment}
										<div>
											<span class="bg-gray-200">
												<Avatar
													src="https://spoonacular.com/cdn/equipment_100x100/{equipment.image}"
													width="w-12"
												/>
											</span>
											<span class="flex-auto">
												<dt class="font-bold">{equipment.name}</dt>
											</span>
											<span>⋮</span>
										</div>
									{/each}
								{:else}
									<div class="text-left">Whoops, no equipment data recorded.. 😭</div>
								{/if}
							</dl>
						</svelte:fragment>
					</AccordionItem> -->
					<AccordionItem open={$drawerStore.meta.recipeInstructions}>
						<svelte:fragment slot="lead"><Icon data={listOl} /></svelte:fragment>
						<svelte:fragment slot="summary">Instructions</svelte:fragment>
						<svelte:fragment slot="content">
							<Stepper on:complete={onCompleteHandler}>
								{#if $drawerStore.meta.recipeInstructions}
									{#each $drawerStore.meta.recipeInstructions as instruction}
										<Step>
											<svelte:fragment slot="header">Step {instruction.number}</svelte:fragment>
											{instruction.step}
											<div class="flex flex-row space-x-2 mt-3">
												{#each instruction.ingredients as ingredient}
													<span class="badge variant-soft-secondary">{ingredient.name}</span>
												{/each}
												{#each instruction.equipment as equipment}
													<span class="badge variant-soft-secondary">{equipment.name}</span>
												{/each}
											</div>
										</Step>
									{/each}
								{:else}
									<dl class="list-dl">
										<div class="text-left">No instructions available</div>
									</dl>
								{/if}
								<!-- ... -->
							</Stepper>
						</svelte:fragment>
					</AccordionItem>
					<!-- ... -->
				</Accordion>
				<span class="block text-center py-10">Tap outside the drawer to close.</span>
			</div>
		</div>
	{/if}
</Drawer>
<!-- App Shell -->
<AppShell>
	<svelte:fragment slot="header">
		<!-- App Bar -->
		<AppBar background="transparent" gridColumns="grid-cols-3" slotDefault="place-self-center" slotTrail="place-content-end">
			<svelte:fragment slot="lead">
				<!-- Desktop -->
				<div class="flex items-center">
					<!-- Mobile Navigations -->
					<button
						class="lg:hidden btn btn-sm mr-4 px-0"
						use:popup={{ event: 'click', target: 'mobileNav' }}
					>
						<span>
							<svg viewBox="0 0 100 80" class="fill-token w-4 h-4">
								<rect width="100" height="20" />
								<rect y="30" width="100" height="20" />
								<rect y="60" width="100" height="20" />
							</svg>
						</span>
					</button>
					<div class="card p-4 w-57 shadow-xl" data-popup="mobileNav">
						<nav class="list-nav align-left">
							<ul>
								<li>
									<a class="!inline-block !font-normal" href="/">
										<span class="w-6">
											<Icon data={home} scale={1.5} class="mr-2" />
											Home
										</span>
									</a>
								</li>
								<li>
									<button class="!inline-block !font-normal" on:click={navigateToDashboard}>
										<span class="w-6">
											<Icon data={book} scale={1.5} class="mr-2" />
											My recipes list
										</span>
									</button>
								</li>
								{#if session?.user}
									<li>
										<button class="!inline-block !font-normal !cursor-not-allowed" disabled>
											<span class="w-6">
												<Icon data={edit} scale={1.5} class="mr-2" />
												<span>Create a new recipe</span>
											</span>
										</button>
									</li>
									<li>
										<button class="!inline-block !font-normal !cursor-not-allowed" disabled>
											<span class="w-6">
												<Icon data={user} scale={1.5} class="mr-2" />
												<span>Manage Account</span>
											</span>
										</button>
									</li>
								{/if}
								<li>
									<a href="/about" class="!inline-block !font-normal">
										<span class="w-6">
											<Icon data={infoCircle} scale={1.5} class="mr-2" />
											About
										</span>
									</a>
								</li>
								<hr class="!my-4" />
								<li>
									{#if session?.user}
										<form action="/.?/logout" method="post" use:enhance={handleLogout}>
											<button class="!inline-block !font-normal" type="submit">
												<Icon data={signOut} scale={1.5} class="mr-2" />
												Sign out
											</button>
										</form>
									{:else}
										<button class="!inline-block !font-normal" on:click={() => showModalAuth()}>
											<Icon data={signIn} scale={1.5} class="mr-2" />
											Sign In
										</button>
									{/if}
								</li>
							</ul>
						</nav>
						<div class="arrow bg-surface-100-800-token" />
					</div>

					<!-- Desktop Navigations -->
					<a class="btn hover:variant-soft-primary !font-normal hidden lg:block" href="/"> Home </a>
					<button
						class="btn hover:variant-soft-primary !font-normal hidden lg:block"
						on:click={navigateToDashboard}
					>
						My Recipes
					</button>
					<a class="btn hover:variant-soft-primary !font-normal hidden lg:block" href="/about">
						About
					</a>
				</div>
			</svelte:fragment>
			
			<a href="/">
				<img src={logo} alt="WhatTheFridge" class="lg:!ml-0 w-[200px] overflow-hidden {logoDisplayClass}"/>
			</a>
			<svelte:fragment slot="trail">
				<button
					class="gh-search gh-icon-btn lg:hidden"
					aria-label="Search this site"
					data-ghost-search=""
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
						stroke-width="2"
						width="20"
						height="20"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
						/>
					</svg>
				</button>
				{#if session?.user}
					<!-- Explore -->
					<div class="relative hidden lg:block">
						<!-- trigger -->
						<button
							class="btn hover:variant-soft-primary !font-normal"
							use:popup={{ event: 'click', target: 'features' }}
						>
							<span>Welcome, {username}!</span>
							<Icon data={chevronDown} scale={0.7} class="opacity-50" />
						</button>
						<!-- popup -->
						<div class="card p-4 w-57 shadow-xl" data-popup="features">
							<nav class="list-nav align-left">
								<ul>
									<li>
										<button class="!inline-block !font-normal" on:click={navigateToDashboard}>
											<span class="w-6">
												<Icon data={book} scale={1.5} class="mr-2" />
												My recipes list
											</span>
										</button>
									</li>
									<li>
										<button class="!inline-block !font-normal !cursor-not-allowed" disabled>
											<span class="w-6">
												<Icon data={edit} scale={1.5} class="mr-2" />
												<span>Create a new recipe</span>
											</span>
										</button>
									</li>
									<li>
										<button class="!inline-block !font-normal !cursor-not-allowed" disabled>
											<span class="w-6">
												<Icon data={user} scale={1.5} class="mr-2" />
												<span>Manage Account</span>
											</span>
										</button>
									</li>
									<hr class="!my-4" />
									<li>
										<form action="/.?/logout" method="post" use:enhance={handleLogout}>
											<button class="!inline-block !font-normal" type="submit">
												<Icon data={signOut} scale={1.5} class="mr-2" />
												Sign out
											</button>
										</form>
									</li>
								</ul>
							</nav>
							<div class="arrow bg-surface-100-800-token" />
						</div>
					</div>
				{:else}
					<button
						class="btn hover:variant-soft-primary !font-normal hidden lg:block"
						on:click={() => showModalAuth()}
					>
						Sign In
					</button>
				{/if}
			</svelte:fragment>
		</AppBar>
	</svelte:fragment>
	<!-- Page Route Content -->
	<slot />

	<svelte:fragment slot="pageFooter">
		<footer class="text-center p-5">
			<p>
				Copyright © 2023, FridgeIt.  All Rights Reserved
			</p>
		</footer>
	</svelte:fragment>
</AppShell>
