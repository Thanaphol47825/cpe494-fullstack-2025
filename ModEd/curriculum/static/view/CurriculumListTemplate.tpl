<div class="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
    <!-- Background Decorative Elements -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
        <div class="absolute top-10 left-10 w-32 h-32 bg-gradient-to-br from-blue-200 to-indigo-200 rounded-full opacity-20 animate-pulse"></div>
        <div class="absolute top-15 right-10 w-80 h-80 bg-gradient-to-br from-purple-200 to-pink-200 rounded-full opacity-15 animate-pulse delay-1000"></div>
    </div>

    <!-- Main Content -->
    <div class="relative z-10 container mx-auto pt-12">
        <!-- Header Section -->
        <div class="text-center mb-6">
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

        <!-- Action Buttons -->
        <div class="max-w-6xl mx-auto mb-8">
            <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-6">
                <div class="flex flex-col sm:flex-row gap-4 justify-between items-center">
                    <div class="flex items-center gap-2">
                        <svg class="w-5 h-5 text-{{gradientFrom}}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="{{icon}}"></path>
                        </svg>
                        <span class="text-gray-700 font-medium">{{title}} Management</span>
                    </div>
                    <div class="flex gap-3">
                        <a routerLink="{{createLink}}" class="bg-gradient-to-r from-{{gradientFrom}} to-{{gradientTo}} hover:from-{{gradientFromHover}} hover:to-{{gradientToHover}} text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-2">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                            </svg>
                            {{createText}}
                        </a>
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
    </div>

    <!-- Search Container - Full Width -->
    <div class="max-w-2xl mx-auto">
        <form method="GET" id="{{searchId}}" class="space-y-6">
            <!-- Form Fields Container -->
            <div id="form-fields" class="space-y-6"></div>
        </form>
    </div>

    <!-- Table Container - Full Width -->
    <div class="relative z-10 w-full">
        <div class="bg-white/80 backdrop-blur-sm shadow-2xl border-t border-white/50 overflow-hidden">
            <div id="{{tableId}}" class="p-6">
                <!-- Table will be rendered here -->
            </div>
        </div>
    </div>
</div>
