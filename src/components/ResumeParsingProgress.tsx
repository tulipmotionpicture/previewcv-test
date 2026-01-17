'use client';

import { useEffect, useState } from 'react';
import { useResumeParser } from '@/hooks/useResumeParser';
import { Loader2, CheckCircle, FileText, Sparkles } from 'lucide-react';
import { SSEEvent } from '@/types/resume-parser';

interface Props {
  resumeId: number;
  onComplete: (metadata: any) => void;
  onError: (error: string) => void;
}

export default function ResumeParsingProgress({ resumeId, onComplete, onError }: Props) {
  const [status, setStatus] = useState<string>('Initializing connection...');
  const [progress, setProgress] = useState<number>(10);
  const { connectToParseStream, parsing } = useResumeParser();

  useEffect(() => {
    const eventSource = connectToParseStream(
      resumeId,
      // On event
      (event: SSEEvent) => {
        if (event.event === 'connected') {
          setStatus('Secure connection established...');
          setProgress(20);
        } else if (event.event === 'started') {
          setStatus('AI is reading your resume...');
          setProgress(40);
        } else if (event.event === 'progress') {
          setStatus(event.data.message || 'Extracting experience and skills...');
          setProgress((prev) => Math.min(prev + 15, 90));
        } else if (event.event === 'completed') {
          setStatus('Extraction complete!');
          setProgress(100);
        } else if (event.event === 'failed') {
          setStatus(event.data.error || 'Parsing failed');
        }
      },
      // On complete
      (metadata) => {
        setTimeout(() => {
          onComplete(metadata);
        }, 1000);
      },
      // On error
      (error) => {
        setStatus(`Error: ${error}`);
        onError(error);
      }
    );

    return () => {
      eventSource?.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resumeId]);

  return (
    <div className="w-full py-12 px-8 flex flex-col items-center justify-center text-center">
      <div className="relative mb-8">
        <div className="w-24 h-24 rounded-full border-4 border-blue-100 dark:border-blue-900/30 flex items-center justify-center relative overflow-hidden">
          <div 
            className="absolute bottom-0 left-0 w-full bg-blue-600/10 transition-all duration-500 ease-out" 
            style={{ height: `${progress}%` }} 
          />
          <FileText className={`w-10 h-10 ${progress === 100 ? 'text-green-500' : 'text-blue-600'} relative z-10 transition-colors duration-500`} />
        </div>
        {parsing && (
          <div className="absolute -top-2 -right-2">
            <Sparkles className="w-8 h-8 text-blue-400 animate-pulse" />
          </div>
        )}
      </div>

      <h2 className="text-2xl font-black text-gray-900 dark:text-gray-100 mb-2 italic">
        {progress === 100 ? 'Analysis Ready!' : 'Parsing Resume'}
      </h2>
      <p className="text-gray-500 dark:text-gray-400 font-medium mb-8 max-w-xs mx-auto">
        {status}
      </p>

      {/* Progress Bar Container */}
      <div className="w-full max-w-md space-y-3">
        <div className="flex items-center justify-between text-xs font-black uppercase tracking-widest text-gray-400">
           <span>Progress</span>
           <span className="text-blue-600">{progress}%</span>
        </div>
        <div className="w-full h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden p-0.5 border border-gray-200 dark:border-gray-700">
          <div 
            className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full transition-all duration-700 ease-out relative"
            style={{ width: `${progress}%` }}
          >
            <div className="absolute inset-0 bg-white/20 animate-pulse" />
          </div>
        </div>
      </div>

      {progress === 100 && (
         <div className="mt-8 animate-in fade-in slide-in-from-bottom-2 duration-1000">
           <div className="flex items-center gap-2 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 px-4 py-2 rounded-xl text-sm font-bold border border-green-100 dark:border-green-800">
             <CheckCircle className="w-4 h-4" />
             Ready for review
           </div>
         </div>
      )}
    </div>
  );
}
