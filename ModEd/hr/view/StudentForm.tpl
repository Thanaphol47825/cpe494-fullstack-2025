<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ title }}</title>
    
    <!-- Core Module Dependencies -->
    <script src="{{ RootURL }}/core/static/js/RouterLinks.js"></script>
    <script src="{{ RootURL }}/core/static/js/TemplateEngine.js"></script>
    <script src="{{ RootURL }}/core/static/js/mustache.min.js"></script>
    <script src="{{ RootURL }}/core/static/js/DOMObject.js"></script>
    <script src="{{ RootURL }}/core/static/js/BaseModuleApplication.js"></script>
    <script src="{{ RootURL }}/core/static/js/FormRender.js"></script>
    
    <!-- HR Module Dependencies -->
    <script src="{{ RootURL }}/hr/static/js/HrConfig.js"></script>
    <script src="{{ RootURL }}/hr/static/js/HrLogger.js"></script>
    <script src="{{ RootURL }}/hr/static/js/HrApplication.js"></script>
    <script src="{{ RootURL }}/hr/static/js/features/StudentForm.js"></script>
    
    <link rel="stylesheet" type="text/css" href="{{ RootURL }}/core/static/css/Style.css" />
    
    <script>
        let RootURL = "{{ RootURL }}";
        let modules = {{{modules}}};
        
        let engine = new TemplateEngine();
        document.addEventListener("DOMContentLoaded", async () => {
            await engine.render();
            
            // Use HR Student Form Feature
            const studentForm = new HrStudentFormFeature(engine, RootURL);
            await studentForm.render();
        });
        
        // Function to navigate back to HR main
        function goBackToHR() {
            window.location.replace(RootURL + '/hr');
        }
    </script>
</head>

<body>
    <div id="MainContainer">
        <div class="min-h-screen bg-gray-50 py-8">
            <div class="max-w-4xl mx-auto px-4 mb-8">
                <div class="flex items-center justify-between">
                    <div>
                        <h1 class="text-3xl font-bold text-gray-900">{{ title }}</h1>
                        <p class="text-gray-600 mt-2">Create a new student using dynamic form generation</p>
                    </div>
                            <button routerLink="hr" 
                                    class="inline-flex items-center px-4 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                                <span class="mr-2">←</span> Back to Main
                            </button>
                </div>
            </div>

            <div class="max-w-4xl mx-auto px-4">
                <div class="bg-white rounded-2xl shadow-lg p-8">
                    <div class="student-form-container">
                        <!-- Form will be dynamically generated here -->
                    </div>
                    
                    <div class="flex items-center justify-between pt-6 border-t border-gray-200">
                        <div class="flex items-center space-x-4">
                            <button type="submit" form="studentForm"
                                    class="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 shadow-lg hover:shadow-xl">
                                Create Student
                            </button>
                            <button type="reset" form="studentForm"
                                    class="inline-flex items-center px-8 py-3 border border-gray-300 text-base font-medium rounded-xl text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200">
                                Reset Form
                            </button>
                        </div>
                        <span id="formStatus" class="text-sm font-medium"></span>
                    </div>
                </div>

                <div id="resultBox" class="hidden mt-6 bg-white rounded-xl border shadow-lg p-6">
                <div class="flex items-center justify-between">
                    <div class="flex-1">
                        <div id="resultContent">
                            <!-- Result content will be inserted here -->
                        </div>
                    </div>
                    <button id="closeResult" 
                            class="ml-4 text-gray-400 hover:text-gray-600 transition-colors">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>
                </div>
            </div>
            </div>
        </div>
    </div>
</body>
</html>
