import React from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid2'; // MUI Grid v2
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Divider from '@mui/material/Divider';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Stack from '@mui/material/Stack';
import { useTheme } from '@mui/material/styles';
import { motion } from 'framer-motion';

// Icons
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import BoltIcon from '@mui/icons-material/Bolt';
import SecurityIcon from '@mui/icons-material/Security';
import IntegrationInstructionsIcon from '@mui/icons-material/IntegrationInstructions';
import CloudQueueIcon from '@mui/icons-material/CloudQueue';
import StarIcon from '@mui/icons-material/Star';
import AlternateEmailIcon from '@mui/icons-material/AlternateEmail';

const MotionBox = motion(Box);
const MotionCard = motion(Card);

const LandingPage = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const features = [
    {
      title: 'Spring Cloud Microservices',
      desc: 'Powered by Eureka discovery, API Gateway routing, and dynamic Spring Cloud Config server resolution.',
      icon: <CloudQueueIcon color="primary" sx={{ fontSize: 36 }} />,
    },
    {
      title: 'Production JWT Auth',
      desc: 'Robust token signing and validations with secure HttpOnly refresh token rotation and role-based permissions.',
      icon: <SecurityIcon color="primary" sx={{ fontSize: 36 }} />,
    },
    {
      title: 'React 19 Frontend',
      desc: 'Vibrant, dark/light theme, glassmorphic UI built using Material UI v6, Redux Toolkit state, and Formik.',
      icon: <BoltIcon color="primary" sx={{ fontSize: 36 }} />,
    },
    {
      title: 'Dockerized Infrastructure',
      desc: 'Instantly spin up MySQL database instances, discovery registries, config stores, and frontend panels.',
      icon: <IntegrationInstructionsIcon color="primary" sx={{ fontSize: 36 }} />,
    },
  ];

  const technologies = [
    'Java 21', 'Spring Boot 3.4', 'Spring Cloud', 'MySQL', 
    'React 19', 'Material UI v6', 'Redux Toolkit', 'Axios Interceptors',
    'Docker Compose', 'JPA Initialization', 'Kafka Ready', 'Framer Motion'
  ];

  const faqs = [
    {
      q: 'How do I add a new business microservice to this template?',
      a: 'Simply copy the structure of auth-service or notification-service, add the new service module definition in the parent pom.xml, register its routing block in config-server/shared/api-gateway.yml, and execute mvn clean package. Service discovery handles dynamic mapping automatically.',
    },
    {
      q: 'Where are the JWT security keys managed?',
      a: 'The JWT credentials, databases connection details, and ports are managed globally inside the Centralized Config Server. Changes take effect on client bootstrap.',
    },
    {
      q: 'Is the refresh token mechanism secure?',
      a: 'Yes. Access tokens are kept strictly in memory (Redux Toolkit state) to mitigate XSS attacks, while refresh tokens are exchanged via secure, HttpOnly, SameSite browser cookies.',
    },
  ];

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', overflowX: 'hidden' }}>
      
      {/* 1. HERO SECTION WITH GRADIENT BACKGROUND */}
      <Box
        sx={{
          background: isDark
            ? 'radial-gradient(circle at 10% 20%, rgba(99, 102, 241, 0.15) 0%, rgba(9, 13, 22, 1) 90.2%)'
            : 'radial-gradient(circle at 10% 20%, rgba(99, 102, 241, 0.05) 0%, rgba(248, 250, 252, 1) 90.2%)',
          py: { xs: 8, md: 15 },
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid size={{ xs: 12, md: 7 }}>
              <MotionBox
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
              >
                <Typography
                  variant="h1"
                  sx={{
                    fontWeight: 800,
                    fontSize: { xs: '2.5rem', sm: '3.5rem', md: '4rem' },
                    lineHeight: 1.15,
                    mb: 2,
                    background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  Enterprise Full-Stack Vendra Template
                </Typography>
                <Typography variant="h5" color="text.secondary" sx={{ fontWeight: 400, mb: 4, lineHeight: 1.5, maxWidth: 600 }}>
                  Build production-quality microservices and beautiful dashboard interfaces in minutes. Zero business logic, 100% reusable architecture.
                </Typography>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <Button
                    variant="contained"
                    color="primary"
                    size="large"
                    onClick={() => navigate('/login')}
                    sx={{ px: 4, py: 1.5, fontSize: '1rem', borderRadius: '10px' }}
                  >
                    Go to Console
                  </Button>
                  <Button
                    variant="outlined"
                    color="inherit"
                    size="large"
                    onClick={() => navigate('/register')}
                    sx={{ px: 4, py: 1.5, fontSize: '1rem', borderRadius: '10px' }}
                  >
                    Create Account
                  </Button>
                </Stack>
              </MotionBox>
            </Grid>
            <Grid size={{ xs: 12, md: 5 }}>
              <MotionBox
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                sx={{ display: 'flex', justifyContent: 'center' }}
              >
                <Box
                  sx={{
                    width: '100%',
                    maxWidth: 400,
                    height: 300,
                    borderRadius: '24px',
                    background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.25) 0%, rgba(236, 72, 153, 0.1) 100%)',
                    border: `1px solid ${theme.palette.divider}`,
                    boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
                    backdropFilter: 'blur(10px)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    p: 4,
                    textAlign: 'center'
                  }}
                >
                  <Box sx={{ bgcolor: 'background.paper', borderRadius: '50%', p: 2, mb: 2, border: `1px solid ${theme.palette.divider}` }}>
                    <LayersIcon color="primary" sx={{ fontSize: 48 }} />
                  </Box>
                  <Typography variant="h5" sx={{ fontWeight: 800 }}>Cloud Ready</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    All services are containerized and set up with Spring Boot Actuator health configurations.
                  </Typography>
                </Box>
              </MotionBox>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* 2. FEATURES SECTION */}
      <Container maxWidth="lg" sx={{ py: 10 }}>
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Typography variant="h3" sx={{ fontWeight: 800, mb: 2 }}>
            Boilerplate Core Infrastructures
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
            Everything common across enterprise applications pre-configured, allowing you to focus on writing domain services immediately.
          </Typography>
        </Box>
        <Grid container spacing={4}>
          {features.map((feat, index) => (
            <Grid size={{ xs: 12, sm: 6, md: 3 }} key={feat.title}>
              <MotionCard
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}
              >
                <CardContent sx={{ p: 3, flexGrow: 1 }}>
                  <Box sx={{ mb: 2 }}>{feat.icon}</Box>
                  <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                    {feat.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                    {feat.desc}
                  </Typography>
                </CardContent>
              </MotionCard>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* 3. TECHNOLOGY STACK SECTION */}
      <Box sx={{ bgcolor: isDark ? '#0e1424' : '#f1f5f9', py: 10, borderY: `1px solid ${theme.palette.divider}` }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography variant="h3" sx={{ fontWeight: 800, mb: 1 }}>
              The Vendra Stack
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Robust technologies aligned for performance, scale, and fast delivery.
            </Typography>
          </Box>
          <Grid container spacing={2} justifyContent="center">
            {technologies.map((tech) => (
              <Grid key={tech}>
                <Chip
                  label={tech}
                  sx={{
                    py: 2.5,
                    px: 1.5,
                    fontSize: '0.95rem',
                    fontWeight: 600,
                    borderRadius: '8px',
                    border: `1px solid ${theme.palette.divider}`,
                    bgcolor: 'background.paper',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                  }}
                />
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* 4. TESTIMONIALS SECTION PLACEHOLDER */}
      <Container maxWidth="lg" sx={{ py: 10 }}>
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Typography variant="h3" sx={{ fontWeight: 800, mb: 2 }}>
            Developer Feedback
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Here's what mockup developers say about using this Vendra starter repository.
          </Typography>
        </Box>
        <Grid container spacing={4}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Card sx={{ p: 2 }}>
              <CardContent>
                <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                  <StarIcon color="warning" />
                  <StarIcon color="warning" />
                  <StarIcon color="warning" />
                  <StarIcon color="warning" />
                  <StarIcon color="warning" />
                </Stack>
                <Typography variant="body1" sx={{ fontStyle: 'italic', mb: 2 }}>
                  "We saved at least 3 hours during our latest Vendra. We didn't have to code gateways, login flows, or Docker networks. We spun up this template and went straight to writing database models for our problem statement."
                </Typography>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  Lead Software Architect, Dev Team Indigo
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Card sx={{ p: 2 }}>
              <CardContent>
                <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                  <StarIcon color="warning" />
                  <StarIcon color="warning" />
                  <StarIcon color="warning" />
                  <StarIcon color="warning" />
                  <StarIcon color="warning" />
                </Stack>
                <Typography variant="body1" sx={{ fontStyle: 'italic', mb: 2 }}>
                  "Highly polished UI components. The dark/light theme out of the box with Redux integration allowed us to demo a beautiful and cohesive dashboard product to the Vendra judges."
                </Typography>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  Frontend Developer, Team ByteMasters
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>

      {/* 5. FAQ SECTION */}
      <Box sx={{ bgcolor: 'background.paper', py: 10, borderTop: `1px solid ${theme.palette.divider}` }}>
        <Container maxWidth="md">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography variant="h3" sx={{ fontWeight: 800, mb: 1 }}>
              Frequently Asked Questions
            </Typography>
            <Typography variant="body1" color="text.secondary">
              General inquiries about the design architecture and extension practices.
            </Typography>
          </Box>
          <Box>
            {faqs.map((faq, index) => (
              <Accordion
                key={index}
                sx={{
                  mb: 1.5,
                  borderRadius: '12px',
                  '&:before': { display: 'none' },
                  boxShadow: 'none',
                  border: `1px solid ${theme.palette.divider}`,
                }}
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{faq.q}</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>{faq.a}</Typography>
                </AccordionDetails>
              </Accordion>
            ))}
          </Box>
        </Container>
      </Box>

      {/* 6. CONTACT SECTION PLACEHOLDER */}
      <Container maxWidth="sm" sx={{ py: 10, textAlign: 'center' }}>
        <Box sx={{ bgcolor: isDark ? '#111827' : '#ffffff', p: 5, borderRadius: '24px', border: `1px solid ${theme.palette.divider}` }}>
          <AlternateEmailIcon color="primary" sx={{ fontSize: 40, mb: 2 }} />
          <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>Need Custom Integrations?</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Fork the repository on GitHub, customize the shared libraries, or send us email inquiries about extension plugins.
          </Typography>
          <Button variant="contained" color="secondary" onClick={() => navigate('/login')}>
            Contact Template Authors
          </Button>
        </Box>
      </Container>

      {/* 7. FOOTER */}
      <Box component="footer" sx={{ py: 6, borderTop: `1px solid ${theme.palette.divider}`, bgcolor: 'background.default' }}>
        <Container maxWidth="lg">
          <Grid container spacing={4} justifyContent="space-between">
            <Grid size={{ xs: 12, md: 4 }}>
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <LayersIcon color="primary" />
                <Typography variant="h6" sx={{ fontWeight: 800 }}>Vendra Starter</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ pr: 4 }}>
                A highly optimized parent repository mapping enterprise Spring services to beautiful React client structures. Built for fast Vendra pivots.
              </Typography>
            </Grid>
            <Grid size={{ xs: 6, md: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>Backend</Typography>
              <Stack spacing={1}>
                <Link href="#" color="text.secondary" variant="body2" underline="hover">Config Server</Link>
                <Link href="#" color="text.secondary" variant="body2" underline="hover">Eureka Registry</Link>
                <Link href="#" color="text.secondary" variant="body2" underline="hover">API Gateway</Link>
                <Link href="#" color="text.secondary" variant="body2" underline="hover">Auth Service</Link>
              </Stack>
            </Grid>
            <Grid size={{ xs: 6, md: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>UI Console</Typography>
              <Stack spacing={1}>
                <Link href="#" color="text.secondary" variant="body2" underline="hover">Redux Slices</Link>
                <Link href="#" color="text.secondary" variant="body2" underline="hover">MUI v6 Styles</Link>
                <Link href="#" color="text.secondary" variant="body2" underline="hover">Axios Interceptors</Link>
                <Link href="#" color="text.secondary" variant="body2" underline="hover">Framer Motion</Link>
              </Stack>
            </Grid>
          </Grid>
          <Divider sx={{ my: 4 }} />
          <Typography variant="body2" color="text.secondary" align="center">
            © {new Date().getFullYear()} Vendra Template Inc. All rights reserved.
          </Typography>
        </Container>
      </Box>

    </Box>
  );
};

export default LandingPage;
