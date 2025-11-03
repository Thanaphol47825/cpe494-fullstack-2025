<div class="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
    <!-- Background Decorative Elements -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
        <div class="absolute top-10 left-10 w-32 h-32 bg-gradient-to-br from-blue-200 to-indigo-200 rounded-full opacity-20 animate-pulse"></div>
        <div class="absolute bottom-10 right-10 w-40 h-40 bg-gradient-to-br from-purple-200 to-pink-200 rounded-full opacity-15 animate-pulse delay-1000"></div>
        <div class="absolute top-1/2 left-1/4 w-24 h-24 bg-gradient-to-br from-emerald-200 to-teal-200 rounded-full opacity-10 animate-pulse delay-2000"></div>
    </div>

    <!-- Main Content -->
    <div class="relative z-10 container mx-auto px-4 py-12">
        <!-- Header Section -->
        <div class="text-center mb-12">
            <div class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-{{gradientFrom}} to-{{gradientTo}} rounded-2xl shadow-lg mb-6">
                <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="{{icon}}"></path>
                </svg>
            </div>
            <h1 class="text-4xl font-bold bg-gradient-to-r from-gray-900 via-{{gradientFromDark}} to-{{gradientToDark}} bg-clip-text text-transparent mb-4">
                {{title}}
            </h1>
            <div class="w-24 h-1 bg-gradient-to-r from-{{gradientFromLight}} to-{{gradientToLight}} mx-auto mb-4 rounded-full"></div>
            <p class="text-lg text-gray-600 max-w-2xl mx-auto">
                {{subtitle}}
            </p>
        </div>

        <!-- Form Card -->
        <div class="max-w-2xl mx-auto">
            <form method="POST" id="{{formId}}" class="space-y-6">
                <!-- Form Fields Container -->
                <div id="form-fields" class="space-y-6"></div>
            </form>
        </div>

        <!-- Action Buttons -->
        <div class="text-center mt-12 space-y-4">
            <!-- View List Button -->
            <div>
                <a routerLink="{{listLink}}" class="inline-flex items-center gap-3 px-8 py-3 bg-gradient-to-r from-{{gradientFrom}} to-{{gradientTo}} text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 font-medium">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"></path>
                    </svg>
                    {{listText}}
                </a>
            </div>
            
            <!-- Back Button -->
            <div>
                <a routerLink="{{backLink}}" class="inline-flex items-center gap-3 px-6 py-3 bg-white/80 backdrop-blur-sm text-gray-700 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 hover:bg-white/90 border border-gray-200/50 font-medium">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                    </svg>
                    {{backText}}
                </a>
            </div>
        </div>
    </div>
</div>