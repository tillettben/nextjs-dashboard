import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function GET() {
  try {
    console.log('Starting test database seeding via script...');

    // Always use test seeding script now that we have proper test database isolation
    const { stdout, stderr } = await execAsync('npx tsx scripts/seed-test.ts');

    if (stderr) {
      console.error('Seeding script stderr:', stderr);
    }

    console.log('Seeding script stdout:', stdout);

    return Response.json({
      message: 'Test database seeded successfully',
      output: stdout,
    });
  } catch (error) {
    console.error('Error running test seeding script:', error);
    return Response.json(
      {
        error: error instanceof Error ? error.message : 'Unknown error',
        details: 'Failed to execute test seeding script',
      },
      { status: 500 }
    );
  }
}
