from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Count, Q
from .models import Task, Category
from .serializers import TaskSerializer, CategorySerializer


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer


class TaskViewSet(viewsets.ModelViewSet):
    queryset = Task.objects.select_related('category').all()
    serializer_class = TaskSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        status_filter = self.request.query_params.get('status')
        priority = self.request.query_params.get('priority')
        category = self.request.query_params.get('category')
        search = self.request.query_params.get('search')

        if status_filter:
            queryset = queryset.filter(status=status_filter)
        if priority:
            queryset = queryset.filter(priority=priority)
        if category:
            queryset = queryset.filter(category_id=category)
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) | Q(description__icontains=search)
            )
        return queryset

    @action(detail=False, methods=['get'])
    def stats(self, request):
        total = Task.objects.count()
        by_status = Task.objects.values('status').annotate(count=Count('id'))
        by_priority = Task.objects.values('priority').annotate(count=Count('id'))
        return Response({
            'total': total,
            'by_status': {item['status']: item['count'] for item in by_status},
            'by_priority': {item['priority']: item['count'] for item in by_priority},
        })

    @action(detail=True, methods=['patch'])
    def move(self, request, pk=None):
        task = self.get_object()
        new_status = request.data.get('status')
        if new_status not in ['todo', 'in_progress', 'done']:
            return Response({'error': 'Invalid status'}, status=status.HTTP_400_BAD_REQUEST)
        task.status = new_status
        task.save()
        return Response(TaskSerializer(task).data)
