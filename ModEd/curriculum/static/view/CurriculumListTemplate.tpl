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
                        <!-- Add New Button -->
                        <div class="transform transition-all duration-300 hover:scale-105">
                            <a routerLink="{{createLink}}" class="group relative inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-{{gradientFrom}} to-{{gradientTo}} text-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 font-medium overflow-hidden">
                                <!-- Animated background overlay -->
                                <span class="absolute inset-0 bg-gradient-to-r from-{{gradientFromHover}} to-{{gradientToHover}} opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                                
                                <!-- Shine effect -->
                                <span class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                                    <span class="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></span>
                                </span>
                                
                                <!-- Icon with animation -->
                                <svg class="w-5 h-5 relative z-10 transform group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                                </svg>
                                
                                <!-- Text -->
                                <span class="relative z-10">{{createText}}</span>
                            </a>
                        </div>
                        
                        <!-- Back Button -->
                        <div class="transform transition-all duration-300 hover:scale-105">
                            <a routerLink="{{backLink}}" class="group relative inline-flex items-center gap-3 px-6 py-4 bg-white/80 backdrop-blur-sm text-gray-700 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-200/50 font-medium overflow-hidden">
                                <!-- Hover background effect -->
                                <span class="absolute inset-0 bg-gradient-to-r from-gray-50 to-gray-100 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                                
                                <!-- Pulse effect on hover -->
                                <span class="absolute inset-0 rounded-xl border-2 border-gray-300/50 opacity-0 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500"></span>
                                
                                <!-- Icon with animation -->
                                <svg class="w-5 h-5 relative z-10 transform group-hover:-translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                                </svg>
                                
                                <!-- Text -->
                                <span class="relative z-10">{{backText}}</span>
                            </a>
                        </div>
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
