const chemistryMock = {
    name: "Chemistry",
    level: "easy",
    description: "A comprehensive introduction to chemistry, covering atoms, molecules, reactions, and the foundations of organic and inorganic chemistry.",
    tags: ["science", "chemistry", "basics"],
    messages: [
        {
          type: "system",
          message: "Hello! I'm your Chemistry tutor. Ask me anything about atoms, molecules, reactions, or concepts from your Chemistry course. I'm here to help you understand and enjoy Chemistry!",
          sequenceNo: 1
        }
      ],
      quizzes: [
        {
          // topic will be set to the Chemistry course _id when inserted into DB
          questions: [
            {
              question: "What is the smallest unit of a chemical element that retains its properties?",
              answer: "Atom",
              options: ["Molecule", "Atom", "Electron", "Compound"],
              hint: "It's the building block of matter."
            },
            {
              question: "Which of the following is NOT a noble gas?",
              answer: "Nitrogen",
              options: ["Helium", "Neon", "Argon", "Nitrogen"],
              hint: "It's essential for life and makes up most of Earth's atmosphere."
            },
            {
              question: "What type of bond involves the sharing of electron pairs between atoms?",
              answer: "Covalent bond",
              options: ["Ionic bond", "Covalent bond", "Metallic bond", "Hydrogen bond"],
              hint: "This type of bond is common in organic molecules."
            }
          ],
          scores: [],
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
        }
      ],
      assignments: [
        {
          // course will be set to the Chemistry course _id when inserted into DB
          question: "Write a 300-word essay explaining the difference between ionic and covalent bonds, and give two examples of each.",
          dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
          submissions: [],
          status: "Pending"
        }
      ],
    resources: [
        {
          videoLink: "https://www.youtube.com/embed/5iTOphGnCtg",
          transcript: `
      Everything is made of atoms. Atoms consist of a core and some electrons. The core is made of protons and neutrons. Depending on the number of protons, you get different elements. Water is made of Hydrogen and Oxygen. This is some Sodium. Quantum mechanics tells us that this is not what atoms actually look like, they look more like this, but we’ll get to that later. For now, just think of atoms as having multiple electron “shells”. The electrons in the outermost shell are called “valence electrons”. Most of chemistry is really just the behaviour of these electrons. Every element is listed in the periodic table. All elements in the same column or “group” have the same number of valence electrons. For the main groups, the number of valence electrons is just the group number from 1 to 8. Except for helium. It’s too small to have 8 electrons, it can only have 2. But still, it acts like a noble gas, so it’s kind of just grouped in with those. Luckily, the transition metals also follow a nice pattern! That was a lie, it’s kind of a mess. But that’s not so important for now, so we’ll get to that later. Elements with the same number of valence electrons tend to show similar behaviour in chemical reactions. For example, the first group, without hydrogen, is called the “alkali metals”. They have one valence electron. They’re shiny metals. They’re kind of soft. And they do this sometimes. All elements in the same row or “period” have the same number of shells. This number increases from top to bottom. Also, the mass gets bigger from left to right, as each element gains a proton, an electron and some neutrons. Depending on the number of neutrons in the core, you get different isotopes of the same element, most of which are pretty unstable, and fall apart, releasing ionizing radiation. If an atom has the same amount of electrons as protons, it has no charge. If it has more, it has a negative charge, and if it has less, it has a positive charge. Charged atoms are called “ions”, negative ions are “anions” and positive ions are “cations”. The periodic table is also pretty much a dictionary, as every cell tells you: The name and symbol of an element, the number of protons in the core, which is also the total number of electrons and the atomic mass, which is the mass of neutrons and protons combined. The periodic table is roughly divided into three categories: metals, non-metals, and semimetals. Two or more atoms bonded together form a molecule. If you have at least two different elements, you get a “compound”. Compounds often behave completely differently than the elements they’re made of. There’s many ways to write molecules, for example the Molecular formula, Lewis-Dot-Structure, and so on. The sharing of electrons is called a “covalent bond”. If the difference in electronegativity is bigger than about 1.7, you get an ionic bond. A good example is Sodium Chloride. The most common place you see Ionic bonds is in salt. Speaking of metals, a pure metal forms “metallic bonds”. This kind of bond is responsible for the properties of metals, like conducting electricity and heat, and being malleable. There are three main states of matter: Solid, liquid and gas. Temperature is the average kinetic energy of particles in a system, or how much and how fast they move and entropy is the amount of disorder. Strong bonds, like ionic bonds, lead to high melting points. All matter can be divided into two categories: Pure substances and mixtures. Mixtures can be homogeneous or heterogeneous. There’s a couple types of chemical reactions: synthesis, decomposition, single replacement, and double replacement. Chemical reactions happen in certain ratios, called “Stoichiometry”. The conservation of mass says that mass cannot be created or destroyed, only converted. It’s important to differentiate between physical and chemical changes. All chemical reactions need activation energy to take place. Catalysts reduce the activation energy needed for a reaction. “Enthalpy” is the internal energy or heat content of a system. If the total enthalpy of a reaction is lower at the end than at the beginning, heat was given off, which is an “exothermic” reaction. If it’s the other way around, it’s “endothermic”. Gibbs Free Energy looks at the change of enthalpy but also entropy of a system. If this whole thing is less than zero, the reaction is “exergonic”, or spontaneous. If it’s bigger than zero, it’s “endergonic”, or not spontaneous. Chemical equilibriums exist when reversible reactions take place at the same speed in both directions. According to Brondsted-Lowry, an acid is a molecule that donates protons, while bases accept protons. The pH is the negative log of the hydronium concentration. Redox reactions are reactions that change the oxidation numbers of elements. All electrons inside an atom are described by four quantum numbers. The principal quantum number increases from top to bottom in the periodic table. Electron configuration helps us understand the structure of atoms and their chemical behavior.
          `
        },
        {
          videoLink: "https://www.youtube.com/embed/PmvLB5dIEp8",
          transcript: `
      Hi! I’m Deboki Chakravarti and welcome to Crash Course Organic Chemistry! The science of chemistry is the science of everything. Stars, computer hard drives, desks, and our bodies are all made up of different arrangements of atoms bonded together, breaking apart, or reacting with each other all the time. This course will focus on organic chemistry: the study of molecules that have carbon atoms. Carbon often catenates, which means it bonds to itself, forming chains, rings, and complex structures. Organic chemicals are everywhere! Over these episodes, we’ll discover new reactions, new compounds, and new methods to understand them. Modern organic chemistry began in the 1800s with the isolation of chemicals from living things and the realization that organic compounds could be synthesized from inorganic ones. Urea, for example, was synthesized from ammonium cyanate. Today, organic chemistry is defined as the study of the structure, properties, composition, reactions, and preparation of carbon-containing compounds, including man-made polymers like plastics. Carbon atoms do predictable things, like make four bonds. There are several ways to represent organic molecules: Lewis structures, condensed structural formulas, and skeletal formulas. Skeletal formulas use zig-zag lines to represent bonds and are useful for complex molecules. Organic molecules often contain heteroatoms (atoms other than carbon and hydrogen), and these are shown explicitly in skeletal formulas. Functional groups are where the interesting chemistry happens in organic molecules. Organic compounds are everywhere in daily life, from dyes to medicines to plastics. In this episode, we discussed the origins of modern organic chemistry, how to write Lewis and skeletal structures, a brief intro to functional groups and heteroatoms, and some fun historical facts about dyes and urea.
          `
        },
        {
          videoLink: "https://www.youtube.com/embed/RxWmdyjR544",
          transcript: `
      Together on this channel we’ve discussed a great many topics in chemistry. In the general chemistry series, we went over all the basics: what atoms and molecules are, and how they behave. Then in the organic chemistry series, we learned about carbon-based compounds, their properties, and how to perform chemical synthesis. Now it’s time to expand further by entering the realm of inorganic chemistry. “Inorganic” means not carbon-based. Compounds like methane and carbon dioxide are organic, and compounds like water and ammonia are inorganic. Inorganic chemistry opens up the rest of the periodic table, including metalloids and all the varieties of metals. So, inorganic chemistry is not the opposite of organic chemistry, but an extension. We’ll focus first on a survey of the periodic table, group by group, to get a sense of properties, behaviors, and applications. We’ll then study transition metal complexes and organometallic chemistry—organic compounds that contain one or more metal atoms. These compounds have revolutionized organic synthesis, offering novel reagents and catalysts. We’ll learn about catalysts and the reactions they promote, as well as their relevance in modern synthesis. We’ve already introduced some organometallics, like Grignard reagents, organolithium reagents, and organocuprates. The difference now is we’ll tackle the finer details of how ligands interact with metal centers in coordination compounds, and the mechanisms by which these compounds do chemistry. While the d-block of the periodic table may have seemed mysterious, it’s now time to shine some light on this region and learn what these elements can do. General and organic chemistry are prerequisites for this series. Organometallic chemistry builds on organic chemistry but is more complicated. If you’ve made it through those topics and want to broaden your understanding of chemistry, let’s learn some inorganic chemistry!
          `
        }
      ]
    }
    module.exports = chemistryMock;