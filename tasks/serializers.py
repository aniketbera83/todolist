from rest_framework import serializers
from .models import Task, Category


class CategorySerializer(serializers.ModelSerializer):
    task_count = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ['id', 'name', 'color', 'task_count', 'created_at']

    def get_task_count(self, obj):
        return obj.tasks.count()


class TaskSerializer(serializers.ModelSerializer):
    category_detail = CategorySerializer(source='category', read_only=True)

    class Meta:
        model = Task
        fields = [
            'id', 'title', 'description', 'status', 'priority',
            'category', 'category_detail', 'due_date', 'created_at', 'updated_at'
        ]
