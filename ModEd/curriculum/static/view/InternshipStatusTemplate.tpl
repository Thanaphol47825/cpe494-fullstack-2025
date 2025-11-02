<!-- filepath: ModEd/curriculum/view/InternshipStatusTemplate.tpl -->
<div class="bg-white rounded-lg shadow p-6">
    <div class="flex items-center">
        <div class="p-2 {{icon_bg_color}} rounded-lg">
            <svg class="w-6 h-6 {{icon_text_color}}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="{{icon_path}}"></path>
            </svg>
        </div>
        <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">{{stat_label}}</p>
            <p id="{{stat_id}}" class="text-2xl font-semibold text-gray-900">{{stat_value}}</p>
        </div>
    </div>
</div>