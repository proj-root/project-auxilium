import { authClient } from '@/lib/auth-client';
import { Play } from 'lucide-react';
import { motion, type Variants } from 'motion/react';
import { useEffect, useRef, useState } from 'react';

const terminalText: string[] = [
  `[  OK  ] Started ACFI event daemon.`,
  `         Starting LSB: Set the CPU Frequency Scaling governor to "ondemand"...`,
  `         Starting lOT/US-SO stack...`,
  `         Starting LSB: Record successful boot for GRUB...`,
  `         Starting Modem Manager...`,
  `[  OK  ] Started MowerAV virus database updater.`,
  `         Starting LSB: Speech Dispatcher...`,
  `         Starting Accounts Service...`,
  `         Starting Permit User Sessions...`,
  `[  OK  ] Started Run anacron jobs.`,
  `         Starting Save/Restore Sound Card State...`,
  `         Starting Thermal Daemon Service...`,
  `[  OK  ] Started CUPS Scheduler.`,
  `         Starting LSB: automatic crash report generation...`,
  `         Starting Restore /etc/resolv.conf if the system crashed before the link was shut down...`,
  `         Starting Snappy daemon...`,
  `[  OK  ] Started Regular background program processing daemon.`,
  `[  OK  ] Started D-Bus System Message Bus.`,
  `         Starting Network Manager...`,
  `[  OK  ] Detecting available GPUs...`,
  `[  OK  ] Started Permit User Sessions.`,
  `         Starting Light Display Manager...`,
  `[  OK  ] Started Login Service.`,
  `[  OK  ] Started System Logging Service.`,
  `[  OK  ] Started LSB: daemon to balance interrupts for SMP systems.`,
  `[  OK  ] Started Authenticate and Authorize Users to Run Privileged Tasks.`,
  `[  OK  ] Started Network Manager.`,
  `[  OK  ] Reached GARDEN network.`,
  `[  OK  ] Started Unattended Upgrades Shutdown.`,
  `         Starting Network Manager Wait Online...`,
  `         Starting Network Manager Script Dispatcher Service...`,
  `[  OK  ] Started Network Manager Script Dispatcher Service.`,
  `         Starting Hostname Service...`,
  `         Starting Mycelium Root Network mesh routing...`,
  `[  OK  ] Established symbiotic connection to peer nodes.`,
  `         Starting ph0t0/Syn Energy Grid optimization...`,
  `[  OK  ] Activated Photosynthetic Processing Unit (PPU-0). Thermal: 36°C.`,
  `         Starting CORE Engine...`,
  `[  OK  ] Cognitive CORE Engine Online. Hyper-focus modules loaded.`,
  `         Starting module cleanup coroutine...`,
  `         Found 17 modules...`,
  `[  OK  ] GARDEN telemetry online (listening on PORT 8085).`,
  `[ WARN ] Unsanitized buffer detected in GRYPHONS sandbox environment. Isolation active.`,
  `         Starting necTAR Authentication & Session Broker...`,
  `[  OK  ] Started necTAR (Network Encrypted Credential Token Authorization Registry).`,
  `         Starting User Environment Manager...`,
  `[  OK  ] Created slice User Slice of UID 1001 (seedling).`,
  `         Starting Deep Storage Mount Daemon...`,
  `[  OK  ] Mounted /dev/xylem_root0 on /home/seedling/garden (ext4, read-write).`,
  `         Starting POLLEN Wireless Broadcast & Discovery daemon...`,
  `[  OK  ] POLLEN Broadcasting on 2.4GHz/5GHz.`,
  `         Starting ROOT-kit Protection Sandbox...`,
  `[  OK  ] Root-kit Protection Sandbox (No relation to actual roots) Active.`,
  `[  OK  ] Battery Optimizer switched to "Daylight-Harvesting" mode.`,
  `         Starting SEED Secret Key Vault...`,
  `[  OK  ] Decrypted secure keyrings using necTAR tokens.`,
  `         Starting Canopy-Desktop Display Server...`,
  `[  OK  ] Reached target Graphical Multi-User Interface.`,
];

function TerminalBox({ onComplete }: { onComplete: () => void }) {
  const { data } = authClient.useSession();

  const [messages, setMessages] = useState<string[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  const messageIndexRef = useRef<number>(0);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const printNextMessage = () => {
      const currentIndex = messageIndexRef.current;

      if (currentIndex < terminalText.length) {
        // Append the next message safely
        setMessages((prev) => [...prev, terminalText[currentIndex] as string]);

        // Increment the mutable index ref
        messageIndexRef.current = currentIndex + 1;

        // Randomized pacing for realism
        const randomDelay = Math.floor(Math.random() * 50) + 50;
        timeoutId = setTimeout(printNextMessage, randomDelay);
      } else {
        // Wait 1s for dramatic effect
        timeoutId = setTimeout(() => {
          setMessages([]);
          setIsComplete(true);
        }, 1500);
      }
    };

    printNextMessage();

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []); // Empty dependency array is perfectly safe now

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // End this sequence and move on to the next
  useEffect(() => {
    if (isComplete) {
      console.log('Terminal typing finished');
      setTimeout(onComplete, 1000);
    }
  }, [isComplete]);

  return (
    <div className='flex h-full w-full flex-col'>
      <div className='flex h-full w-full flex-col overflow-hidden font-mono'>
        {!isComplete && messages.map((msg, index) => (
          <div key={index} className='whitespace-pre'>
            {msg}
          </div>
        ))}

        {isComplete && (
          <div>
            {data?.user
              ? `[BOOT COMPLETE] - Welcome back, ${data?.user.name}...`
              : `[BOOT COMPLETE] - Incognito Protocol active. Please login, SEEDLING...`}
          </div>
        )}

        <div className='animate-caret-blink'>
          <span>█</span>
        </div>

        <div ref={endRef} />
      </div>
      <div className='mt-2 flex w-full flex-row-reverse'>
        <button
          type='button'
          onClick={() => setIsComplete(true)}
          className='text-muted-foreground hover:border-b-muted-foreground flex cursor-pointer items-center gap-1 border-b border-b-transparent font-mono'
        >
          Skip <Play className='size-4' />
        </button>
      </div>
    </div>
  );
}

interface InitialisingScreenProps {
  onAnimationComplete: () => void;
}

export function InitialisingScreen({
  onAnimationComplete,
}: InitialisingScreenProps) {
  // const [isSequenceDone, setIsSequenceDone] = useState(false);

  const containerVariants: Variants = {
    hidden: { opacity: 1 },
    visible: { opacity: 1 },
    exit: {
      opacity: 0,
      transition: { duration: 0.2, ease: 'easeOut' },
    },
  };

  return (
    // Main screen
    <motion.div
      variants={containerVariants}
      initial={'hidden'}
      animate={'visible'}
      exit={'exit'}
      className='bg-background text-foreground fixed inset-x-40 inset-y-10 z-50 flex flex-col items-center justify-center'
    >
      <TerminalBox onComplete={onAnimationComplete} />
    </motion.div>
  );
}
