import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import CalendarEvent from '@/models/Calendar';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const userId = searchParams.get('userId');

    let query: any = {};

    if (startDate && endDate) {
      query.startDate = { $gte: new Date(startDate) };
      query.endDate = { $lte: new Date(endDate) };
    }

    if (userId) {
      query.$or = [
        { createdBy: userId },
        { attendees: userId },
      ];
    }

    const events = await CalendarEvent.find(query)
      .populate('createdBy', 'name email avatar')
      .populate('course', 'title')
      .populate('attendees', 'name email avatar')
      .sort({ startDate: 1 });

    return NextResponse.json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json(
      { error: 'Failed to fetch events' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();

    const event = new CalendarEvent({
      ...body,
      startDate: new Date(body.startDate),
      endDate: new Date(body.endDate),
    });

    await event.save();

    const populatedEvent = await event.populate([
      { path: 'createdBy', select: 'name email avatar' },
      { path: 'course', select: 'title' },
      { path: 'attendees', select: 'name email avatar' },
    ]);

    return NextResponse.json(populatedEvent, { status: 201 });
  } catch (error) {
    console.error('Error creating event:', error);
    return NextResponse.json(
      { error: 'Failed to create event' },
      { status: 500 }
    );
  }
}
