import { motion } from 'motion/react';
import { ArrowRightIcon } from '@phosphor-icons/react';
import Button from '../../components/ui/Button';
import HomePreview from './HomePreview';
import HomeWalkthrough from './HomeWalkthrough';
import './home.css';

export default function HomePage() {
  return (
    <main className="home-page" id="main-content" tabIndex={-1}>
      <section className="home-intro">
        <motion.div
          className="home-intro__copy"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1>
            Read the label.
            <br />
            Know your food.
          </h1>
          <p>
            Find ingredients, explore six languages, and ask questions about the food in your hands.
          </p>
          <Button href="#/extract" variant="primary" size="lg" trailingIcon={ArrowRightIcon}>
            Extract ingredients
          </Button>
        </motion.div>
        <HomePreview />
      </section>
      <HomeWalkthrough />
    </main>
  );
}
