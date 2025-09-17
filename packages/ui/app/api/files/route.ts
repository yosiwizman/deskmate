import { NextRequest, NextResponse } from 'next/server';
import pino from 'pino';
import { v4 as uuidv4 } from 'uuid';
import { createClient } from '@/lib/supabase-server';
import { FileMeta } from '@/lib/contracts';

const logger = pino({ level: 'info' });

export async function GET(request: NextRequest) {
  const correlationId = uuidv4();
  
  try {
    const supabase = createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      logger.warn({ correlationId, authError: authError?.message }, 'Unauthorized files access');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { data: files, error } = await supabase
      .from('files')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    
    if (error) {
      logger.error({ correlationId, error: error.message }, 'Failed to fetch files');
      return NextResponse.json({ error: 'Failed to fetch files' }, { status: 500 });
    }
    
    logger.info({ correlationId, userId: user.id, fileCount: files.length }, 'Files fetched successfully');
    
    return NextResponse.json(files);
    
  } catch (error) {
    logger.error({ 
      correlationId, 
      error: error instanceof Error ? error.message : String(error) 
    }, 'Files GET request failed');
    
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const correlationId = uuidv4();
  
  try {
    const supabase = createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      logger.warn({ correlationId, authError: authError?.message }, 'Unauthorized file upload');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await request.json();
    const { path, name, size, mime, sha256 } = body;
    
    if (!path || !name || size === undefined) {
      return NextResponse.json({ error: 'Missing required fields: path, name, size' }, { status: 400 });
    }
    
    const { data: file, error } = await supabase
      .from('files')
      .insert({
        user_id: user.id,
        path,
        name,
        size,
        mime,
        sha256,
      })
      .select()
      .single();
    
    if (error) {
      logger.error({ correlationId, error: error.message }, 'Failed to create file record');
      return NextResponse.json({ error: 'Failed to create file record' }, { status: 500 });
    }
    
    logger.info({ correlationId, userId: user.id, fileId: file.id, fileName: name }, 'File record created successfully');
    
    return NextResponse.json(file);
    
  } catch (error) {
    logger.error({ 
      correlationId, 
      error: error instanceof Error ? error.message : String(error) 
    }, 'Files POST request failed');
    
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const correlationId = uuidv4();
  
  try {
    const supabase = createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      logger.warn({ correlationId, authError: authError?.message }, 'Unauthorized file deletion');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { searchParams } = new URL(request.url);
    const fileId = searchParams.get('id');
    
    if (!fileId) {
      return NextResponse.json({ error: 'Missing file ID' }, { status: 400 });
    }
    
    // First, get the file record to get the storage path
    const { data: file, error: fetchError } = await supabase
      .from('files')
      .select('path')
      .eq('id', fileId)
      .eq('user_id', user.id)
      .single();
    
    if (fetchError || !file) {
      logger.error({ correlationId, fileId, error: fetchError?.message }, 'File not found');
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }
    
    // Delete from storage (attempt, but don't fail if storage delete fails)
    try {
      const { error: storageError } = await supabase.storage
        .from('uploads-prod')
        .remove([file.path]);
      
      if (storageError) {
        logger.warn({ correlationId, fileId, path: file.path, error: storageError.message }, 'Failed to delete from storage');
      }
    } catch (storageError) {
      logger.warn({ correlationId, fileId, path: file.path, error: String(storageError) }, 'Storage deletion error');
    }
    
    // Delete the database record
    const { error: deleteError } = await supabase
      .from('files')
      .delete()
      .eq('id', fileId)
      .eq('user_id', user.id);
    
    if (deleteError) {
      logger.error({ correlationId, fileId, error: deleteError.message }, 'Failed to delete file record');
      return NextResponse.json({ error: 'Failed to delete file' }, { status: 500 });
    }
    
    logger.info({ correlationId, userId: user.id, fileId }, 'File deleted successfully');
    
    return new NextResponse(null, { status: 204 });
    
  } catch (error) {
    logger.error({ 
      correlationId, 
      error: error instanceof Error ? error.message : String(error) 
    }, 'Files DELETE request failed');
    
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}