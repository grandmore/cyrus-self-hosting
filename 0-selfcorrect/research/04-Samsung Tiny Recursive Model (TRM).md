# Samsung's 7-million parameter model beats AI giants

**Samsung's Tiny Recursive Model (TRM) achieved 44.6% accuracy on the ARC-AGI benchmark with just 7 million parameters, outperforming Google's Gemini 2.5 Pro (37%) and OpenAI's o3-mini-high (34.5%)—models with tens of thousands of times more parameters.** Announced October 7, 2025, by Samsung's Advanced Institute of Technology AI Lab in Montreal, this breakthrough challenges the AI industry's "bigger is better" paradigm by proving architectural ingenuity can trump brute-force scale. The model trained for under $500 in 2 days on four GPUs, making cutting-edge AI accessible to researchers without massive computational budgets. Led by researcher Alexia Jolicoeur-Martineau, the open-source release (MIT license) demonstrates that recursive reasoning—where a tiny 2-layer network loops through itself to progressively refine answers—can achieve superior performance on complex reasoning tasks. This represents a fundamental shift toward efficiency and specialization in AI development.

## Recursive reasoning replaces parameter scale

TRM's innovation centers on a **single 2-layer neural network that uses recursive refinement** rather than billions of parameters. The architecture loops through itself up to 16 times, with each iteration updating both an internal "reasoning state" and the final answer. This creates a self-correcting process where the model progressively improves its solution, simulating the depth of much larger networks without the computational cost.

The technical breakthrough involves **deep supervision at each recursive step**, where the model learns not just the final answer but also how to improve intermediate reasoning states. A learned adaptive halting mechanism determines when the model has reached a satisfactory solution, preventing unnecessary computation. Remarkably, researchers found that their **smallest 2-layer architecture generalized better than a 4-layer version**, likely because the ultra-compact design naturally prevents overfitting on small training datasets.

This approach differs fundamentally from traditional language models that encode knowledge through massive parameter counts. Instead, TRM encodes reasoning capability through architectural innovation, enabling it to learn from just 1,000 training examples (on Sudoku-Extreme) while achieving human-like generalization.

## Abstract reasoning performance that defies scaling laws

TRM's most striking results came on the **ARC-AGI benchmark**, widely considered a proxy for general intelligence and abstract reasoning ability. With 7 million parameters—representing just 0.01% the size of competing frontier models—TRM achieved 44.6% accuracy on ARC-AGI-1, decisively beating Google Gemini 2.5 Pro (37%), OpenAI's o3-mini-high (34.5%), and DeepSeek R1 (15.8%). On the newer, more challenging ARC-AGI-2 benchmark, TRM reached 7.8% accuracy compared to Gemini's 4.9% and o3-mini's 3%.

On specialized reasoning tasks, the performance gap widens further. TRM scored **87.4% accuracy on Sudoku-Extreme** puzzles, crushing the previous best model's 55% and far exceeding large language models that struggle with such tasks. On complex 30×30 maze navigation (Maze-Hard benchmark), TRM achieved 85.3% accuracy compared to 74.5% for the earlier Hierarchical Reasoning Model.

These results demonstrate that for structured reasoning tasks—logic puzzles, abstract pattern recognition, spatial reasoning—a well-designed small model can outperform systems with 10,000 times more parameters. While xAI's Grok 4 currently leads the ARC-AGI leaderboards (66.7% on ARC-AGI-1), it does so with vastly greater computational resources, making TRM's efficiency breakthrough particularly significant.

## Radical simplification from previous architectures

TRM represents a simplified evolution of earlier recursive approaches. The preceding Hierarchical Reasoning Model (HRM) required two separate networks and complex mathematical dependencies based on the Implicit Function Theorem. TRM collapses this to **a single unified network** that's dramatically easier to train and more effective in practice.

The simplification yielded immediate performance gains—boosting Sudoku-Extreme accuracy from HRM's 56.5% to TRM's 87.4%. By using straightforward backpropagation through the full recursive chain rather than fixed-point iteration, the model became both more powerful and more accessible to implement. The architecture eliminates biological analogies and mathematical complexity in favor of a clean, elegant design: one tiny network that thinks recursively.

This "less is more" principle extended to the network depth itself. Counter to conventional wisdom, researchers found their 2-layer network consistently outperformed 4-layer versions on generalization tasks, suggesting that ultra-compact architectures may naturally resist overfitting and capture more fundamental reasoning patterns.

## Training efficiency that democratizes AI research

The economic implications are profound. TRM trained for **under $500 on four NVIDIA H100 GPUs in just two days**, compared to millions of dollars and weeks of computation for large language models. This thousand-fold cost reduction makes frontier AI research accessible to university labs, startups, and individual researchers—not just tech giants with massive data centers.

The model achieved this efficiency while training on remarkably small datasets. Using only 1,000 Sudoku puzzle examples, TRM learned to generalize to unseen problems with 87.4% accuracy. This data efficiency stems from the recursive architecture's inherent bias toward systematic reasoning rather than pattern memorization. Each recursive loop acts as implicit regularization, preventing the model from overfitting to training examples.

Energy consumption drops proportionally. Where training and running billion-parameter models requires industrial-scale power consumption, TRM operates at a fraction of the cost. As Sebastian Raschka, an AI research engineer, noted: "Yes, it's still possible to do cool stuff without a data centre." The model's MIT license and GitHub availability (github.com/SamsungSAILMontreal/TinyRecursiveModels) further democratize access, allowing the research community to build upon these techniques.

## Specialized excellence over general-purpose mediocrity

TRM exemplifies a critical shift in AI strategy: **purpose-built models for specific domains outperform bloated generalists**. While the model excels at structured reasoning tasks—logic puzzles, abstract pattern recognition, spatial navigation—it's not designed for open-ended generation, creative writing, or general conversation. This specialization is its strength, not a limitation.

Industry observers recognized the broader implications immediately. Deedy Das, partner at Menlo Ventures, emphasized: "Most AI companies today use general-purpose LLMs with prompting for tasks. For specific tasks, smaller models may not just be cheaper, but far higher quality! Startups could train models for under $1000 for specific subtasks." This suggests a future AI landscape of coordinated small specialist models rather than monolithic general-purpose systems.

The approach uses **latent reasoning** that operates on abstract representations rather than language-dependent "chain-of-thought" methods. This makes TRM more robust and less brittle than prompting-based approaches that rely on models explaining their reasoning in natural language. The recursive loops happen in learned representation space, closer to how humans think through problems internally before articulating solutions.

## Conclusion: October 2025 marks architecture's triumph over scale

Samsung's TRM announcement crystallizes a paradigm shift already underway in October 2025. The model proves that architectural ingenuity, training methodology, and task-specific optimization can achieve what industry leaders previously thought required billions of parameters and millions in compute budgets. With parameter counts 10,000 times smaller than frontier models, TRM doesn't just match but exceeds their performance on abstract reasoning benchmarks.

The breakthrough's timing is significant. October 2025 saw broader industry recognition that "small is sufficient"—MIT Technology Review named small language models one of its 10 Breakthrough Technologies for 2025, and multiple papers documented how model selection could reduce AI energy consumption by 27.8%. TRM provides concrete proof that this efficiency revolution can deliver not just comparable but superior performance.

Most importantly, the open-source release under MIT license accelerates the field's evolution. By demonstrating that $500 and four GPUs can produce state-of-the-art reasoning capabilities, Samsung has challenged the assumption that cutting-edge AI requires corporate-scale resources. As lead researcher Alexia Jolicoeur-Martineau stated: "The idea that one must rely on massive foundational models trained for millions of dollars by some big corporation in order to solve hard tasks is a trap." TRM offers an escape route, pointing toward a more accessible, efficient, and sustainable future for AI development.