from django.contrib import admin
from .models import Task, Category


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'color', 'created_at']
    search_fields = ['name']


@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ['title', 'status', 'priority', 'category', 'due_date', 'created_at']
    list_filter = ['status', 'priority', 'category']
    search_fields = ['title', 'description']
    list_editable = ['status', 'priority']
    date_hierarchy = 'created_at'
