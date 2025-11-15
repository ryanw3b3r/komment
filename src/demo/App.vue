<script setup lang="ts">
import { ref } from "vue";

const count = ref(0);
const message = ref("Welcome to Komment Demo!");
</script>

<template>
  <div
    class="km:min-h-screen km:bg-gradient-to-br km:from-blue-50 km:to-indigo-100"
  >
    <!-- Header -->
    <header class="km:bg-white km:shadow-sm">
      <div
        class="km:max-w-7xl km:mx-auto km:px-4 km:py-6 sm:km:px-6 lg:km:px-8"
      >
        <h1 class="km:text-3xl km:font-bold km:text-gray-900">Komment Demo</h1>
        <p class="km:mt-2 km:text-sm km:text-gray-600">
          Click the "Comment" button to start adding comments on this page!
        </p>
      </div>
    </header>

    <!-- Main Content -->
    <main
      class="km:max-w-7xl km:mx-auto km:px-4 km:py-12 sm:km:px-6 lg:km:px-8"
    >
      <!-- Hero Section -->
      <div class="km:bg-white km:rounded-lg km:shadow-md km:p-8 km:mb-8">
        <h2 class="km:text-2xl km:font-bold km:text-gray-900 km:mb-4">
          {{ message }}
        </h2>
        <p class="km:text-gray-700 km:mb-6">
          This is a demo application showcasing the Komment collaborative
          commenting tool. You can add comments anywhere on this page by
          clicking the "Comment" button in the bottom-right corner.
        </p>
        <div class="km:flex km:gap-4">
          <button
            @click="count++"
            class="km:px-6 km:py-3 km:bg-blue-500 km:text-white km:rounded-lg km:hover:bg-blue-600 km:transition-colors km:font-medium"
          >
            Count: {{ count }}
          </button>
          <button
            @click="message = 'You clicked the button!'"
            class="km:px-6 km:py-3 km:bg-green-500 km:text-white km:rounded-lg km:hover:bg-green-600 km:transition-colors km:font-medium"
          >
            Change Message
          </button>
        </div>
      </div>

      <!-- Features Grid -->
      <div class="km:grid km:grid-cols-1 md:km:grid-cols-3 km:gap-6 km:mb-8">
        <div class="km:bg-white km:rounded-lg km:shadow-md km:p-6">
          <div
            class="km:w-12 km:h-12 km:bg-blue-100 km:rounded-lg km:flex km:items-center km:justify-center km:mb-4"
          >
            <svg
              class="km:w-6 km:h-6 km:text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
              />
            </svg>
          </div>
          <h3 class="km:text-lg km:font-semibold km:text-gray-900 km:mb-2">
            Easy Commenting
          </h3>
          <p class="km:text-gray-600 km:text-sm">
            Click anywhere on the page to add comments. Perfect for design
            reviews and feedback.
          </p>
        </div>

        <div class="km:bg-white km:rounded-lg km:shadow-md km:p-6">
          <div
            class="km:w-12 km:h-12 km:bg-green-100 km:rounded-lg km:flex km:items-center km:justify-center km:mb-4"
          >
            <svg
              class="km:w-6 km:h-6 km:text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          </div>
          <h3 class="km:text-lg km:font-semibold km:text-gray-900 km:mb-2">
            Real-time Collaboration
          </h3>
          <p class="km:text-gray-600 km:text-sm">
            See comments from other users in real-time using Server-Sent Events.
          </p>
        </div>

        <div class="km:bg-white km:rounded-lg km:shadow-md km:p-6">
          <div
            class="km:w-12 km:h-12 km:bg-purple-100 km:rounded-lg km:flex km:items-center km:justify-center km:mb-4"
          >
            <svg
              class="km:w-6 km:h-6 km:text-purple-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
              />
            </svg>
          </div>
          <h3 class="km:text-lg km:font-semibold km:text-gray-900 km:mb-2">
            Customizable
          </h3>
          <p class="km:text-gray-600 km:text-sm">
            Configure button position, API endpoint, and more through simple
            options.
          </p>
        </div>
      </div>

      <!-- How to Use Section -->
      <div class="km:bg-white km:rounded-lg km:shadow-md km:p-8">
        <h2 class="km:text-xl km:font-bold km:text-gray-900 km:mb-4">
          How to Use
        </h2>
        <ol
          class="km:list-decimal km:list-inside km:space-y-3 km:text-gray-700"
        >
          <li>
            Click the <strong class="km:text-blue-600">"Comment"</strong> button
            in the bottom-right corner
          </li>
          <li>
            Your cursor will change to a crosshair, and the page will be frozen
          </li>
          <li>Click anywhere on the page where you want to add a comment</li>
          <li>Type your comment in the popup that appears</li>
          <li>
            Click <strong class="km:text-green-600">"Save"</strong> to save your
            comment or <strong class="km:text-gray-600">"Cancel"</strong> to
            discard it
          </li>
          <li>
            Click <strong class="km:text-red-600">"Finish"</strong> to exit
            commenting mode
          </li>
          <li>Hover over comment markers to view existing comments</li>
        </ol>
      </div>

      <!-- Installation Section -->
      <div
        class="km:bg-gradient-to-r km:from-blue-500 km:to-indigo-600 km:rounded-lg km:shadow-md km:p-8 km:mt-8 km:text-white"
      >
        <h2 class="km:text-2xl km:font-bold km:mb-4">Try It Yourself!</h2>
        <p class="km:mb-4">Install Komment in your Vue 3.5 project with npm:</p>
        <pre
          class="km:bg-black/20 km:rounded km:p-4 km:overflow-x-auto"
        ><code>npm install komment</code></pre>
        <p class="km:mt-4 km:text-sm km:opacity-90">
          Then add it to your main.ts file and start commenting!
        </p>
      </div>
    </main>

    <!-- Footer -->
    <footer class="km:bg-white km:shadow-sm km:mt-12">
      <div
        class="km:max-w-7xl km:mx-auto km:px-4 km:py-6 sm:km:px-6 lg:km:px-8"
      >
        <p class="km:text-center km:text-gray-600 km:text-sm">
          Komment - Collaborative Commenting for Modern Web Applications
        </p>
      </div>
    </footer>
  </div>
</template>

<style scoped>
/* Demo-specific styles */
</style>
