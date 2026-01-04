import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { TABLES } from '@/types';

export async function GET() {
  try {
    const { data, error } = await supabase
      .from(TABLES.RESULTS)
      .select('*')
      .order('employee_name', { ascending: true });

    if (error) {
      return NextResponse.json(
        { error: '获取数据失败', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      results: data || [],
    });

  } catch (error: any) {
    return NextResponse.json(
      { error: '获取数据失败', details: error.message },
      { status: 500 }
    );
  }
}
