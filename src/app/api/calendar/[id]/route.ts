import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import CalendarEvent from '@/models/Calendar';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    

    const event = await CalendarEvent.findById(params.id)
      .populate('createdBy', 'name email avatar')
      .populate('course', 'title')
      .populate('attendees', 'name email avatar');

    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(event);
  } catch (error) {
    console.error('Error fetching event:', error);
    return NextResponse.json(
      { error: 'Failed to fetch event' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    

    const body = await request.json();

    const event = await CalendarEvent.findByIdAndUpdate(
      params.id,
      {
        ...body,
        startDate: body.startDate ? new Date(body.startDate) : undefined,
        endDate: body.endDate ? new Date(body.endDate) : undefined,
      },
      { new: true, runValidators: true }
    )
      .populate('createdBy', 'name email avatar')
      .populate('course', 'title')
      .populate('attendees', 'name email avatar');

    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(event);
  } catch (error) {
    console.error('Error updating event:', error);
    return NextResponse.json(
      { error: 'Failed to update event' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    

    const event = await CalendarEvent.findByIdAndDelete(params.id);

    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Error deleting event:', error);
    return NextResponse.json(
      { error: 'Failed to delete event' },
      { status: 500 }
    );
  }
}
