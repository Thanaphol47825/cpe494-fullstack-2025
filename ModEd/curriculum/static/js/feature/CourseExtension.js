if (typeof window !== 'undefined' && !window.CourseExtension) {
    class CourseExtension {
        constructor(application) {
            this.application = application;
            this.host = null;
        }

        async initialize() {
            // Subclasses will override this to load templates/data
        }

        getCustomColumns() {
            return [];
        }

        setHost(host) {
            this.host = host; // Add this method
        }
    }

    if (typeof window !== 'undefined') {
        window.CourseExtension = CourseExtension;
    }
}