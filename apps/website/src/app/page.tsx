import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default function Home() {
	return (
		<main className="flex flex-col items-center">
			<section className="flex h-[85vh] flex-col justify-center">
				<div className="inline-block pb-4 text-center">
					<h1 className="inline bg-gradient-to-r from-indigo-400 to-cyan-500 bg-clip-text text-4xl font-bold tracking-tight text-transparent">
						Your Discord bot for{' '}
					</h1>
					<h1 className="inline bg-gradient-to-r from-cyan-500 to-teal-400 bg-clip-text text-4xl font-bold tracking-tight text-transparent underline decoration-green-400 decoration-wavy">
						tickets with threads
					</h1>
					<h1 className="inline bg-gradient-to-r bg-clip-text text-4xl font-bold tracking-tight text-teal-400 text-transparent">
						.
					</h1>
				</div>
				<div className="flex justify-center">
					<Button variant="outline" asChild className="w-fit">
						<a
							target="_blank"
							href="https://discord.com/api/oauth2/authorize?client_id=880454049370083329&permissions=395137133584&scope=bot+applications.commands"
						>
							<Plus />
							Invite to your Discord Server
						</a>
					</Button>
				</div>
			</section>
		</main>
	);
}
