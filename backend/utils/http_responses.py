from rest_framework import status
from rest_framework.response import Response

def success_response(data, message="Operation successful"):
    """Standard success response format"""
    return Response({
        'success': True,
        'message': message,
        'data': data
    }, status=status.HTTP_200_OK)

def error_response(message, error=None):
    """Standard error response format"""
    return Response({
        'success': False,
        'message': message,
        'error': error
    }, status=status.HTTP_400_BAD_REQUEST)

def created_response(data, message="Resource created successfully"):
    """Standard created response format"""
    return Response({
        'success': True,
        'message': message,
        'data': data
    }, status=status.HTTP_201_CREATED)

def not_found_response(message="Resource not found"):
    """Standard not found response format"""
    return Response({
        'success': False,
        'message': message,
        'data': None
    }, status=status.HTTP_404_NOT_FOUND)
