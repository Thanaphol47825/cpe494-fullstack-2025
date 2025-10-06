<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ title }}</title>
    <link rel="stylesheet" href="{{ RootURL }}/core/static/css/Style.css">
</head>

<body>
    <div id="MainContainer">
        <div class="min-h-screen bg-gray-50 py-8">
            <div class="max-w-4xl mx-auto px-4">
                <div class="bg-red-50 border border-red-200 rounded-lg p-6">
                    <h2 class="text-lg font-semibold text-red-800">{{ error_title }}</h2>
                    <p class="text-red-600 mt-2">{{ error_message }}</p>
                    <div class="mt-4">
                        <button id="retryButton" 
                                class="inline-flex items-center px-4 py-2 text-sm font-medium text-red-800 bg-red-100 border border-red-300 rounded-lg hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors">
                            Retry
                        </button>
                        <button routerLink="/hr" 
                                class="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors ml-3">
                            Back to Main
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script src="{{ RootURL }}/core/static/js/TemplateEngine.js"></script>
    <script src="{{ RootURL }}/core/static/js/RouterLinks.js"></script>
    <script>
        let RootURL = "{{ RootURL }}";
        
        let engine = new TemplateEngine();
        document.addEventListener("DOMContentLoaded", async () => {
            await engine.render();
            
            // Setup retry button
            const retryButton = document.getElementById('retryButton');
            if (retryButton) {
                retryButton.addEventListener('click', () => {
                    window.location.reload();
                });
            }
        });
    </script>
</body>
</html>
