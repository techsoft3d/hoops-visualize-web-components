import { HoopsButton } from '@ts3d-hoops/ui-kit-react';
import { useEffect, useState } from 'react';

type Model = {
  scs: string;
  name: string;
  description: string;
  image: string;
};

export type ModelCatalogProps = {
  onModelSelected?: (modelName: string) => unknown;
};

export function ModelCatalog(props: ModelCatalogProps) {
  const [models, setModels] = useState<Model[]>([]);

  useEffect(() => {
    fetch('./sample-models.json')
      .then((response) => response.json())
      .then((data) => setModels(data))
      .catch((error) => console.error('Error fetching models:', error));
  }, []);

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr',
        gap: '2rem',
      }}
    >
      {models.map((model) => (
        <HoopsButton
          key={model.scs}
          onClick={() => {
            if (props.onModelSelected) {
              props.onModelSelected(model.scs);
            }
          }}
        >
          <div
            style={{
              position: 'relative',
            }}
          >
            <img
              src={`${import.meta.env.VITE_THUMBNAIL_URL}/${model.image}`}
              alt={model.name}
              className="model-image"
              style={{
                width: '100%',
                objectFit: 'contain',
                objectPosition: 'center',
              }}
            />
            <div
              style={{
                position: 'absolute',
                left: '0.5rem',
                right: '0.5rem',
                bottom: '0.5rem',
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                color: 'white',
                backdropFilter: 'blur(8px)',
              }}
            >
              <h3 style={{ margin: '0.25rem' }}>{model.name}</h3>
              <p style={{ margin: '0.25rem' }}>{model.description}</p>
            </div>
          </div>
        </HoopsButton>
      ))}
    </div>
  );
}

export default ModelCatalog;
