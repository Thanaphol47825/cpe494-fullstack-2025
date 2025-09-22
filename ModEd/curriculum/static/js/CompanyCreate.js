class CompanyCreate {
    constructor(application) {
        this.application = application;
    }

    async render() {
        console.log("Create Company Form");
        console.log(this.application);

        if (!document.querySelector('script[src*="tailwindcss"]') && !document.querySelector('link[href*="tailwind"]')) {
            const script = document.createElement('script');
            script.src = "https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4";
            document.head.appendChild(script);
        }

        const root = window.__ROOT_URL__ || "";

        this.application.mainContainer.innerHTML = `
            <div class="min-h-screen bg-gray-50 text-gray-900">
                <div class="max-w-3xl mx-auto py-10 px-4">
                    <header class="mb-8">
                        <h1 class="text-3xl font-bold tracking-tight">Add Company</h1>
                    </header>

                    <section class="bg-white rounded-2xl shadow p-6">
                        <form
                            id="companyForm"
                            method="POST"
                            action="${root}/curriculum/createCompany"
                            class="grid grid-cols-1 md:grid-cols-2 gap-4"
                        >
                            <div>
                                <label for="CompanyName" class="block text-sm font-medium mb-1">
                                    Company Name <span class="text-red-500">*</span>
                                </label>
                                <input
                                    name="CompanyName"
                                    id="CompanyName"
                                    type="text"
                                    required
                                    class="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    placeholder="Company Name"
                                />
                            </div>

                            <div>
                                <label for="CompanyAddress" class="block text-sm font-medium mb-1">Company Address</label>
                                <input
                                    name="CompanyAddress"
                                    id="CompanyAddress"
                                    class="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    placeholder="Company Address"
                                />
                            </div>

                            <div class="md:col-span-2">
                                <button
                                    type="submit"
                                    class="w-full bg-indigo-600 text-white rounded-xl px-4 py-2 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                >
                                    Save Class Material
                                </button>
                            </div>
                        </form>
                    </section>
                </div>
            </div>
        `;
    }
}