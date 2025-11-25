<template>
  <div class="min-h-dvh flex flex-col">
    <header class="border-b bg-card text-card-foreground">
      <div class="max-w-5xl mx-auto px-4 h-14 flex items-center">
        <div class="flex-1">
          <NuxtLink to="/" class="font-semibold text-lg">SealCV</NuxtLink>
        </div>
        <nav class="flex-1 flex justify-center gap-6">
          <Button variant="ghost" as-child>
            <NuxtLink to="/cv">CV</NuxtLink>
          </Button>
        </nav>
        <div class="flex-1 flex justify-end"></div>
      </div>
    </header>
    <main class="flex-1">
      <slot />
    </main>
  </div>
</template>