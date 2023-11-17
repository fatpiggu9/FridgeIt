<script lang="ts">
	import Icon from 'svelte-awesome';
	import heart from 'svelte-awesome/icons/heart';
	import spinner from 'svelte-awesome/icons/spinner';
	import { getContext, onMount } from 'svelte';
	import type { DrawerSettings } from '@skeletonlabs/skeleton';
	import { drawerStore, toastStore } from '@skeletonlabs/skeleton';
	import { enhance, type SubmitFunction } from '$app/forms';
	import { page } from '$app/stores';
	import Lazy from 'svelte-lazy';

	// @ts-ignore
	const { showModalAuth } = getContext('authentication');

	export let recipe: App.Recipe;
	export let recipeDetail: App.RecipeDetail | undefined = undefined;
	
	let loading: boolean = false;
	let changingFav: boolean = false;
	let placeholderElement: HTMLElement;
	const removePlaceholder = (e: any) => {
		placeholderElement.removeAttribute('data-placeholder');
	};

	$: ({ supabase, session } = $page.data);
	$: bouncingHeart = changingFav ? 'animate-bounce' : '';
	$: fillHeart = recipe.bookmarked ? '!fill-red-500' : '';
	$: if (!session?.user) {
		recipe.bookmarked = false;
	} else {
		setBookmarkState();
	}

	const setBookmarkState = async () => {
		try {
			if (!session?.user) return;

			const { count, error } = await supabase
				.from('favourites')
				.select('*', { count: 'exact', head: true })
				.eq('recipe_id', recipe.id)
				.eq('user_id', session?.user.id);

			if (error) throw error;
			recipe.bookmarked = !count ? false : true;
		} catch (error) {
			toastStore.trigger({
				message: error as string,
				background: 'variant-filled-error'
			});
		} finally {
			// Combine Spooncular likes with Supabase likes =)
			const { count } = await supabase
				.from('favourites')
				.select('*', { count: 'exact', head: true })
				.eq('recipe_id', recipe.id);

			recipe.totalLikes = (recipe.likes !== undefined ? recipe.likes : recipe.aggregateLikes) + count;
		}
	};

	const toggleFav = async () => {
		if (!session?.user) {
			showModalAuth();
			return;
		}

		try {
			changingFav = true;
			recipe.totalLikes = (recipe.likes !== undefined ? recipe.likes : recipe.aggregateLikes) + (recipe.bookmarked ? -1 : 1);
			recipe.bookmarked = !recipe.bookmarked;
			if (recipe.bookmarked) {
				console.log('Liking..');
				const { data, error } = await supabase
					.from('favourites')
					.insert({ recipe_id: recipe.id, user_id: session?.user.id });
				if (error) {
					throw error;
				}
			} else {
				console.log('Unliking..');
				const { data, error } = await supabase
					.from('favourites')
					.delete()
					.eq('recipe_id', recipe.id)
					.eq('user_id', session?.user.id);
				if (error) {
					throw error;
				}
			}
		} catch (error) {
			recipe.totalLikes = recipe.likes + (recipe.bookmarked ? -1 : 1);
			recipe.bookmarked = !recipe.bookmarked;
			toastStore.trigger({
				message: error as string,
				background: 'variant-filled-error'
			});
		} finally {
			changingFav = false;
		}
	};

	const stripHtmlTags = (html: string) => {
		return html.replace(/<\/?[^>]+(>|$)/g, '');
	};

	const handleRecipeDetail: SubmitFunction = ({ cancel }) => {
		if (recipeDetail) {
			cancel();	
			recipeDetail.summary = stripHtmlTags(recipeDetail.summary);
			const drawerSettings: DrawerSettings = {
				id: 'recipe',
				width: 'w-[280px] md:w-[550px]',
				meta: {
					recipeDetail: recipeDetail,
					recipeEquipments: recipeDetail.equipments,
					recipeInstructions: recipeDetail.steps
				}
			};
			
			return drawerStore.open(drawerSettings);
		}

		loading = true;
		return async ({ result }) => {
			if (result.type === 'success') {
				// Strip HTML tags from summary
				let recipeDetail = result.data?.detail;
				recipeDetail.summary = stripHtmlTags(recipeDetail.summary);

				const drawerSettings: DrawerSettings = {
					id: 'recipe',
					width: 'w-[280px] md:w-[550px]',
					meta: {
						recipeDetail: recipeDetail,
						recipeEquipments: result.data?.equipments,
						recipeInstructions: result.data?.instructions
					}
				};
				drawerStore.open(drawerSettings);
			} else if (result.type === 'error') {
				toastStore.trigger({
					message: `Internal Server Error. Please try again later.`,
					background: 'variant-filled-error'
				});
			}
			loading = false;
		};
	};

	const cardFadeOption = {delay: 0, duration: 700};
	onMount(setBookmarkState);
</script>

<form action="?/fetchRecipeDetail" method="post" use:enhance={handleRecipeDetail}>
	<button class="relative card card-hover overflow-hidden variant-soft w-full" disabled={loading}>
		<input name="id" type="hidden" value={recipe.id} />
		<header
			bind:this={placeholderElement}
			data-placeholder
			class="overflow-hidden relative bg-gray-200 w-full"
		>
			<Lazy height={260} fadeOption={cardFadeOption}>
				<img
					on:load={removePlaceholder} 
					src={recipe.image}
					class="object-cover !w-full !h-full"
					alt={recipe.title}
				/>
			</Lazy>
		</header>

		<div class="p-4 space-y-4 h-full">
			<h4 class="h3 text-center truncate" data-toc-ignore>
				{recipe.title}
			</h4>
		</div>
		<footer class="p-4 flex justify-start items-center space-x-4 absolute top-0 right-0">
			<div class="flex-auto flex justify-between items-center">
				<button
					type="button"
					class="btn btn-sm badge variant-filled-surface"
					on:click|stopPropagation|preventDefault={toggleFav}
				>
					<span><Icon data={heart} class="{fillHeart} {bouncingHeart}" /></span>
					<span>
						{#if recipe.totalLikes !== undefined}
							{recipe.totalLikes}
						{:else}
							<Icon data={spinner} pulse />
						{/if}
					</span>
				</button>
			</div>
		</footer>
	</button>
</form>