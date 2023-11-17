<script lang="ts">
	import { page } from '$app/stores';
	// import { onMount } from 'svelte';
	// import { toastStore } from '@skeletonlabs/skeleton';
	import FoodCard from '$lib/components/FoodCard.svelte';
	import { Paginator } from '@skeletonlabs/skeleton';
	import filter from 'svelte-awesome/icons/filter';
	import spinner from 'svelte-awesome/icons/spinner';
	import Icon from 'svelte-awesome';
	import { onMount } from 'svelte';
	import { toastStore } from '@skeletonlabs/skeleton';
	import { applyAction, deserialize } from '$app/forms';
	import { error } from '@sveltejs/kit';

	let recipes: App.Recipe[] = [];
	let recipesDetail: App.RecipeDetail[] = [];
	let searchKeyword: string = '';

	$: ({ supabase, session } = $page.data);
	let fetching: boolean = true;

	onMount(async () => {
		fetching = true;
		const { data, error } = await supabase
			.from('favourites')
			.select('*')
			.eq('user_id', session?.user?.id);

		if (error) {
			return toastStore.trigger({
				message: `Something went wrong. Please try again later.`,
				background: 'variant-filled-error'
			});
		}

		const recipeIds = data.map((recipe: any) => recipe.recipe_id);
		const response = await fetch('', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded'
			},
			body: new URLSearchParams({
				recipeIds: recipeIds
			})
		});

		const resData: any = deserialize(await response.text());
		if (resData.type === 'error' || resData.type === 'failure') {
			return toastStore.trigger({
				message: resData.data?.error,
				background: 'variant-filled-error'
			});
		}

		recipes = resData.data?.recipes;
		recipesDetail = resData?.data?.recipesDetail;
		fetching = false;
	});

	const getRecipeDetailById = (id: number) => {
		return recipesDetail.find((recipeDetail) => recipeDetail.id === id);
	};

	$: recipesCount = recipes.length;
	$: paginatorSettings = {
		offset: 0,
		limit: 12,
		size: recipesCount,
		amounts: [4, 8, 12, 16, 20]
	};

	$: filteredRecipes = recipes.filter((recipe) => {
		const recipeTitle = recipe.title.toLocaleLowerCase();
		return recipeTitle.includes(searchKeyword.toLocaleLowerCase());
	});

	$: paginatedRecipes = filteredRecipes.slice(
		paginatorSettings.offset * paginatorSettings.limit,
		paginatorSettings.offset * paginatorSettings.limit + paginatorSettings.limit
	);
</script>

<div class="container h-full mx-auto py-3 lg:py-10 px-5 flex flex-col justify-center items-center">
	<div class="space-y-10 text-center flex flex-col items-center w-full">
		<h1>My Recipes</h1>
		<div class="input-group input-group-divider grid-cols-[auto_1fr_auto] max-w-[40rem]">
			<div class="input-group-shim"><Icon data={filter} /></div>
			<input type="search" bind:value={searchKeyword} placeholder="Filter by name..." />
		</div>
		{#if fetching}
			<span class="p-5"
				><Icon data={spinner} pulse class="mr-2" />Geting your favourite recipes</span
			>
		{:else if !filteredRecipes.length}
			<span class="p-5">No recipes found..</span>
		{:else if recipes.length}
			<div class="mx-10 !mt-14 w-full text-token grid grid-cols-1 lg:grid-cols-4 gap-8">
				{#each paginatedRecipes as recipe}
					{#key recipe}
						<FoodCard {recipe} recipeDetail={getRecipeDetailById(recipe.id)} />
					{/key}
				{/each}
			</div>
			<Paginator bind:settings={paginatorSettings} class="mt-10" />
		{:else}
			<span class="p-5">You have no favourites recipes..</span>
		{/if}
	</div>
</div>
